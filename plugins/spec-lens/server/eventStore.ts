import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  eventSeverities,
  eventSources,
  timelineEventKinds,
  type JsonObject,
  type TimelineEvent,
  type TimelineMarker
} from '../../../shared/spec-lens/events';
import type { SpecLensPathContract } from '../../../shared/spec-lens/paths';
import { err, ok, type Result } from '../../../shared/spec-lens/result';

export type StorageErrorCode = 'write_failed' | 'read_failed';

export interface StorageError {
  readonly code: StorageErrorCode;
  readonly message: string;
  readonly path?: string;
  readonly eventId?: string;
}

export interface EventStoreQuery {
  readonly sourceMode: 'live';
}

export interface EventStoreTimelineResponse {
  readonly events: readonly TimelineEvent[];
  readonly corruptEvents: readonly TimelineEvent[];
  readonly totalEvents: number;
}

export interface EventStore {
  appendEvent<TPayload extends JsonObject>(
    event: TimelineEvent<TPayload>
  ): Promise<Result<TimelineEvent<TPayload>, StorageError>>;
  queryEvents(query: EventStoreQuery): Promise<Result<EventStoreTimelineResponse, StorageError>>;
  getEvent(id: string): Promise<Result<TimelineEvent | null, StorageError>>;
}

export function createEventStore(input: { readonly paths: SpecLensPathContract }): EventStore {
  return new NdjsonEventStore(input.paths);
}

class NdjsonEventStore implements EventStore {
  private appendQueue: Promise<void> = Promise.resolve();

  constructor(private readonly paths: SpecLensPathContract) {}

  async appendEvent<TPayload extends JsonObject>(
    event: TimelineEvent<TPayload>
  ): Promise<Result<TimelineEvent<TPayload>, StorageError>> {
    const appendResult = this.appendQueue.then(
      () => this.writeEvent(event),
      () => this.writeEvent(event)
    );
    this.appendQueue = appendResult.then(
      () => undefined,
      () => undefined
    );

    return appendResult;
  }

  async queryEvents(
    _query: EventStoreQuery
  ): Promise<Result<EventStoreTimelineResponse, StorageError>> {
    const readResult = await this.readEventLog();

    if (!readResult.ok) {
      return readResult;
    }

    const events: TimelineEvent[] = [];
    const corruptEvents: TimelineEvent[] = [];

    readResult.value.forEach((line, index) => {
      if (line.trim() === '') {
        return;
      }

      const lineNumber = index + 1;
      const parsedResult = parseEventLine(line, lineNumber);

      if (parsedResult.ok) {
        events.push(parsedResult.value);
        return;
      }

      corruptEvents.push(parsedResult.error);
    });

    return ok({
      events,
      corruptEvents,
      totalEvents: events.length + corruptEvents.length
    });
  }

  async getEvent(id: string): Promise<Result<TimelineEvent | null, StorageError>> {
    const queryResult = await this.queryEvents({ sourceMode: 'live' });

    if (!queryResult.ok) {
      return queryResult;
    }

    const event =
      queryResult.value.events.find((candidate) => candidate.id === id) ??
      queryResult.value.corruptEvents.find((candidate) => candidate.id === id) ??
      null;

    return ok(event);
  }

  private async writeEvent<TPayload extends JsonObject>(
    event: TimelineEvent<TPayload>
  ): Promise<Result<TimelineEvent<TPayload>, StorageError>> {
    try {
      await mkdir(path.dirname(this.paths.eventLogFile), { recursive: true });
      await appendFile(this.paths.eventLogFile, `${JSON.stringify(event)}\n`, 'utf8');

      return ok(event);
    } catch (error) {
      return err({
        code: 'write_failed',
        message: createErrorMessage('イベントを保存できませんでした', error),
        path: this.paths.eventLogFile,
        eventId: event.id
      });
    }
  }

  private async readEventLog(): Promise<Result<readonly string[], StorageError>> {
    try {
      const contents = await readFile(this.paths.eventLogFile, 'utf8');

      return ok(contents.split(/\r?\n/));
    } catch (error) {
      if (getErrorCode(error) === 'ENOENT') {
        return ok([]);
      }

      return err({
        code: 'read_failed',
        message: createErrorMessage('イベントログを読み込めませんでした', error),
        path: this.paths.eventLogFile
      });
    }
  }
}

type UnknownRecord = { readonly [key: string]: unknown };

function parseEventLine(
  line: string,
  lineNumber: number
): Result<TimelineEvent, TimelineEvent> {
  try {
    const parsed = JSON.parse(line) as unknown;

    if (isTimelineEvent(parsed)) {
      return ok(parsed);
    }

    return err(createCorruptEvent({ line, lineNumber, reason: 'invalid_event_shape' }));
  } catch {
    return err(createCorruptEvent({ line, lineNumber, reason: 'invalid_json' }));
  }
}

function createCorruptEvent(input: {
  readonly line: string;
  readonly lineNumber: number;
  readonly reason: string;
}): TimelineEvent {
  return {
    id: `corrupt-line-${input.lineNumber}`,
    schemaVersion: 1,
    kind: 'corrupt',
    occurredAt: '1970-01-01T00:00:00.000Z',
    source: 'system',
    severity: 'warning',
    title: '破損したイベント行を隔離',
    summary: '読み取れないNDJSON行を破損イベントとして扱った。',
    relatedPaths: [],
    screenshotIds: [],
    payload: {
      lineNumber: input.lineNumber,
      rawLine: input.line,
      reason: input.reason
    }
  };
}

function isTimelineEvent(value: unknown): value is TimelineEvent {
  const record = toRecord(value);

  if (record === null) {
    return false;
  }

  return (
    typeof record.id === 'string' &&
    record.schemaVersion === 1 &&
    isOneOf(record.kind, timelineEventKinds) &&
    typeof record.occurredAt === 'string' &&
    isOneOf(record.source, eventSources) &&
    isOneOf(record.severity, eventSeverities) &&
    typeof record.title === 'string' &&
    isOptionalString(record.summary) &&
    isStringArray(record.relatedPaths) &&
    isOptionalString(record.specRef) &&
    isOptionalString(record.taskRef) &&
    isStringArray(record.screenshotIds) &&
    isOptionalMarker(record.marker) &&
    isJsonObject(record.payload)
  );
}

function isOneOf<TValue extends readonly string[]>(
  value: unknown,
  candidates: TValue
): value is TValue[number] {
  return typeof value === 'string' && candidates.includes(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function isOptionalMarker(value: unknown): value is TimelineMarker | undefined {
  return value === undefined || value === 'presentation' || value === 'important';
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isJsonObject(value: unknown): value is JsonObject {
  return toRecord(value) !== null;
}

function toRecord(value: unknown): UnknownRecord | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
}

function createErrorMessage(prefix: string, error: unknown): string {
  if (error instanceof Error) {
    return `${prefix}: ${error.message}`;
  }

  return prefix;
}

function getErrorCode(error: unknown): string | undefined {
  const record = toRecord(error);
  const code = record?.code;

  return typeof code === 'string' ? code : undefined;
}
