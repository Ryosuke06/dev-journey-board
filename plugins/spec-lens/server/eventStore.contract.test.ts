import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { createSpecLensDomainFixtures } from '../../../shared/spec-lens/fixtures';
import { createSpecLensPaths, type SpecLensPathContract } from '../../../shared/spec-lens/paths';
import type { JsonObject, TimelineEvent } from '../../../shared/spec-lens/events';
import type { Result } from '../../../shared/spec-lens/result';
import { createEventStore } from './eventStore';

type StorageErrorCode = 'write_failed' | 'read_failed';

interface StorageError {
  readonly code: StorageErrorCode;
  readonly message: string;
  readonly path?: string;
  readonly eventId?: string;
}

interface EventStoreQuery {
  readonly sourceMode: 'live';
}

interface EventStoreTimelineResponse {
  readonly events: readonly TimelineEvent[];
  readonly corruptEvents: readonly TimelineEvent[];
  readonly totalEvents: number;
}

interface EventStore {
  appendEvent<TPayload extends JsonObject>(
    event: TimelineEvent<TPayload>
  ): Promise<Result<TimelineEvent<TPayload>, StorageError>>;
  queryEvents(query: EventStoreQuery): Promise<Result<EventStoreTimelineResponse, StorageError>>;
  getEvent(id: string): Promise<Result<TimelineEvent | null, StorageError>>;
}

const specName = 'spec-lens-timeline';
const fixtures = createSpecLensDomainFixtures();
let temporaryProjectRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryProjectRoots.map((projectRoot) => rm(projectRoot, { recursive: true, force: true }))
  );
  temporaryProjectRoots = [];
});

async function createProjectContext(): Promise<{
  readonly projectRoot: string;
  readonly paths: SpecLensPathContract;
}> {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'spec-lens-event-store-'));
  temporaryProjectRoots.push(projectRoot);

  return {
    projectRoot,
    paths: createSpecLensPaths({ projectRoot, specName })
  };
}

async function seedEventLog(
  paths: SpecLensPathContract,
  lines: readonly string[]
): Promise<void> {
  await mkdir(path.dirname(paths.eventLogFile), { recursive: true });
  await writeFile(paths.eventLogFile, `${lines.join('\n')}\n`, 'utf8');
}

function expectOk<TValue, TError>(
  result: Result<TValue, TError>
): asserts result is { readonly ok: true; readonly value: TValue } {
  expect(result.ok).toBe(true);

  if (!result.ok) {
    throw new Error('expected ok result');
  }
}

function expectErr<TValue, TError>(
  result: Result<TValue, TError>
): asserts result is { readonly ok: false; readonly error: TError } {
  expect(result.ok).toBe(false);

  if (result.ok) {
    throw new Error('expected err result');
  }
}

function parseNdjsonLine(line: string): unknown {
  return JSON.parse(line) as unknown;
}

function createUnlinkedDecisionEvent(): TimelineEvent {
  return {
    id: 'evt-2026-06-17-unlinked-decision',
    schemaVersion: 1,
    kind: 'decision',
    occurredAt: '2026-06-17T12:00:00.000+09:00',
    source: 'user',
    severity: 'info',
    title: '未紐付けの意思決定',
    summary: '特定の仕様やタスクには紐付かないが、発表で説明したい判断を残す。',
    relatedPaths: [],
    screenshotIds: [],
    marker: 'important',
    payload: {
      decision: 'EventStoreはappend-onlyのNDJSONとして始める'
    }
  };
}

describe('EventStore contract', () => {
  test('イベントをUTF-8 NDJSONとしてappend-onlyで追記する', async () => {
    const { paths } = await createProjectContext();
    const store = createEventStore({ paths });

    const firstAppend = await store.appendEvent(fixtures.normalEvent);
    const secondAppend = await store.appendEvent(fixtures.eventWithoutScreenshot);

    expectOk(firstAppend);
    expectOk(secondAppend);

    const contents = await readFile(paths.eventLogFile, 'utf8');
    const lines = contents.trimEnd().split('\n');

    expect(paths.eventLogFile).toContain(`${path.sep}.spec-lens${path.sep}events.ndjson`);
    expect(lines).toHaveLength(2);
    expect(parseNdjsonLine(lines[0])).toMatchObject({
      id: fixtures.normalEvent.id,
      kind: 'cc_sdd_file'
    });
    expect(parseNdjsonLine(lines[1])).toMatchObject({
      id: fixtures.eventWithoutScreenshot.id,
      kind: 'task_state'
    });
  });

  test('正常なNDJSON行を発生順のイベントとして読み込む', async () => {
    const { paths } = await createProjectContext();

    await seedEventLog(paths, [
      JSON.stringify(fixtures.normalEvent),
      JSON.stringify(fixtures.eventWithoutScreenshot)
    ]);

    const store = createEventStore({ paths });
    const queryResult = await store.queryEvents({ sourceMode: 'live' });
    const singleEventResult = await store.getEvent(fixtures.eventWithoutScreenshot.id);

    expectOk(queryResult);
    expectOk(singleEventResult);
    expect(queryResult.value.events.map((event) => event.id)).toEqual([
      fixtures.normalEvent.id,
      fixtures.eventWithoutScreenshot.id
    ]);
    expect(queryResult.value.corruptEvents).toEqual([]);
    expect(queryResult.value.totalEvents).toBe(2);
    expect(singleEventResult.value?.id).toBe(fixtures.eventWithoutScreenshot.id);
  });

  test('破損したNDJSON行をcorruptイベントとして隔離し、読み取れるイベントを返す', async () => {
    const { paths } = await createProjectContext();

    await seedEventLog(paths, [
      JSON.stringify(fixtures.normalEvent),
      '{broken',
      JSON.stringify(fixtures.eventWithoutScreenshot)
    ]);

    const store = createEventStore({ paths });
    const result = await store.queryEvents({ sourceMode: 'live' });

    expectOk(result);
    expect(result.value.events.map((event) => event.id)).toEqual([
      fixtures.normalEvent.id,
      fixtures.eventWithoutScreenshot.id
    ]);
    expect(result.value.corruptEvents).toHaveLength(1);
    expect(result.value.corruptEvents[0]).toMatchObject({
      schemaVersion: 1,
      kind: 'corrupt',
      source: 'system',
      severity: 'warning',
      payload: {
        lineNumber: 2,
        rawLine: '{broken'
      }
    });
  });

  test('ローカル保存先へ書き込めない場合はwrite_failedをResultで返す', async () => {
    const { paths, projectRoot } = await createProjectContext();
    const blockedRuntimeRoot = path.join(projectRoot, 'blocked-runtime');
    const blockedPaths: SpecLensPathContract = {
      ...paths,
      runtimeRoot: blockedRuntimeRoot,
      eventLogFile: path.join(blockedRuntimeRoot, 'events.ndjson')
    };

    await writeFile(blockedRuntimeRoot, 'not a directory', 'utf8');

    const store = createEventStore({ paths: blockedPaths });
    const result = await store.appendEvent(fixtures.normalEvent);

    expectErr(result);
    expect(result.error).toMatchObject({
      code: 'write_failed',
      path: blockedPaths.eventLogFile,
      eventId: fixtures.normalEvent.id
    });
  });

  test('スクリーンショット参照ありイベントを画像本体ではなく参照として保存・読込する', async () => {
    const { paths } = await createProjectContext();
    const store = createEventStore({ paths });

    const appendResult = await store.appendEvent(fixtures.normalEvent);
    const queryResult = await store.queryEvents({ sourceMode: 'live' });

    expectOk(appendResult);
    expectOk(queryResult);

    const [event] = queryResult.value.events;
    const contents = await readFile(paths.eventLogFile, 'utf8');

    expect(event?.screenshotIds).toEqual(fixtures.normalEvent.screenshotIds);
    expect(contents).toContain(fixtures.normalEvent.screenshotIds[0]);
    expect(contents).not.toContain('data:image');
    expect(contents).not.toContain('![');
  });

  test('仕様やタスクに紐付かないイベントも未紐付けイベントとして保存・読込する', async () => {
    const { paths } = await createProjectContext();
    const unlinkedEvent = createUnlinkedDecisionEvent();
    const store = createEventStore({ paths });

    const appendResult = await store.appendEvent(unlinkedEvent);
    const queryResult = await store.queryEvents({ sourceMode: 'live' });

    expectOk(appendResult);
    expectOk(queryResult);

    const loadedEvent = queryResult.value.events.find((event) => event.id === unlinkedEvent.id);

    expect(loadedEvent).toMatchObject({
      id: unlinkedEvent.id,
      kind: 'decision',
      source: 'user'
    });
    expect(loadedEvent?.specRef).toBeUndefined();
    expect(loadedEvent?.taskRef).toBeUndefined();
  });
});
