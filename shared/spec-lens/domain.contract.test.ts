import { describe, expect, test } from 'vitest';

type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonPrimitive = string | number | boolean | null;
type JsonObject = { readonly [key: string]: JsonValue };

type TimelineEventKind =
  | 'cc_sdd_file'
  | 'task_state'
  | 'verification'
  | 'decision'
  | 'vite_hmr'
  | 'vite_reload'
  | 'vite_error'
  | 'screenshot'
  | 'check_result'
  | 'demo_marker'
  | 'corrupt';

type EventSource = 'cc_sdd' | 'vite' | 'user' | 'capture' | 'check' | 'demo' | 'system';
type EventSeverity = 'info' | 'success' | 'warning' | 'error';
type ScreenshotStatus = 'available' | 'missing' | 'failed';
type CheckItemStatus = 'success' | 'warning' | 'failure' | 'skipped';
type RecorderStatus = 'recording' | 'paused' | 'error' | 'unknown';

interface TimelineEvent<TPayload extends JsonObject = JsonObject> {
  id: string;
  schemaVersion: 1;
  kind: TimelineEventKind;
  occurredAt: string;
  source: EventSource;
  severity: EventSeverity;
  title: string;
  summary?: string;
  relatedPaths: string[];
  specRef?: string;
  taskRef?: string;
  screenshotIds: string[];
  marker?: 'presentation' | 'important';
  payload: TPayload;
}

interface ScreenshotAsset {
  id: string;
  eventId: string;
  path: string;
  capturedAt: string;
  width?: number;
  height?: number;
  status: ScreenshotStatus;
  errorMessage?: string;
}

interface CheckReport {
  id: string;
  eventId: string;
  runAt: string;
  items: CheckItem[];
}

interface CheckItem {
  id: string;
  label: string;
  status: CheckItemStatus;
  reason: string;
  relatedPaths: string[];
}

interface WeekPageResponse {
  weekStartDate: string;
  weekEndDate: string;
  previousWeekStartDate: string;
  nextWeekStartDate: string;
  totalEvents: number;
  events: TimelineEvent[];
  summary: {
    eventCount: number;
    screenshotCount: number;
    errorCount: number;
    failedCheckCount: number;
  };
}

interface DemoTimeline {
  sourceMode: 'demo';
  events: TimelineEvent[];
  screenshots: ScreenshotAsset[];
}

interface DomainConstantsModule {
  timelineEventKinds: readonly TimelineEventKind[];
  eventSources: readonly EventSource[];
  eventSeverities: readonly EventSeverity[];
  screenshotStatuses: readonly ScreenshotStatus[];
  checkItemStatuses: readonly CheckItemStatus[];
  recorderStatuses: readonly RecorderStatus[];
}

interface DomainFixtureSet {
  normalEvent: TimelineEvent;
  eventWithoutScreenshot: TimelineEvent;
  captureFailedEvent: TimelineEvent;
  corruptEvent: TimelineEvent;
  screenshotAsset: ScreenshotAsset;
  missingScreenshotAsset: ScreenshotAsset;
  failedScreenshotAsset: ScreenshotAsset;
  checkReport: CheckReport;
  weekPage: WeekPageResponse;
  demoTimeline: DemoTimeline;
  recorderStatuses: readonly RecorderStatus[];
}

interface DomainFixturesModule {
  createSpecLensDomainFixtures(): DomainFixtureSet;
}

async function loadDomainConstants(): Promise<DomainConstantsModule> {
  const modulePath = './events';

  return import(/* @vite-ignore */ modulePath) as Promise<DomainConstantsModule>;
}

async function loadDomainFixtures(): Promise<DomainFixturesModule> {
  const modulePath = './fixtures';

  return import(/* @vite-ignore */ modulePath) as Promise<DomainFixturesModule>;
}

describe('SpecLens domain model contract', () => {
  test.fails('タイムラインイベントの種別、発生元、重要度、記録状態を固定する', async () => {
    const domain = await loadDomainConstants();

    expect(domain.timelineEventKinds).toEqual([
      'cc_sdd_file',
      'task_state',
      'verification',
      'decision',
      'vite_hmr',
      'vite_reload',
      'vite_error',
      'screenshot',
      'check_result',
      'demo_marker',
      'corrupt'
    ]);
    expect(domain.eventSources).toEqual([
      'cc_sdd',
      'vite',
      'user',
      'capture',
      'check',
      'demo',
      'system'
    ]);
    expect(domain.eventSeverities).toEqual(['info', 'success', 'warning', 'error']);
    expect(domain.recorderStatuses).toEqual(['recording', 'paused', 'error', 'unknown']);
  });

  test.fails('スクリーンショットとチェック結果の状態を固定する', async () => {
    const domain = await loadDomainConstants();

    expect(domain.screenshotStatuses).toEqual(['available', 'missing', 'failed']);
    expect(domain.checkItemStatuses).toEqual(['success', 'warning', 'failure', 'skipped']);
  });

  test.fails('後続タスクで再利用する正常、画像なし、画像保存失敗、破損イベントのフィクスチャを提供する', async () => {
    const { createSpecLensDomainFixtures } = await loadDomainFixtures();
    const fixtures = createSpecLensDomainFixtures();

    expect(fixtures.normalEvent).toMatchObject({
      schemaVersion: 1,
      kind: 'cc_sdd_file',
      source: 'cc_sdd',
      severity: 'info'
    });
    expect(fixtures.normalEvent.screenshotIds.length).toBeGreaterThan(0);
    expect(fixtures.eventWithoutScreenshot.screenshotIds).toEqual([]);
    expect(fixtures.captureFailedEvent).toMatchObject({
      kind: 'screenshot',
      source: 'capture',
      severity: 'error'
    });
    expect(fixtures.corruptEvent).toMatchObject({
      kind: 'corrupt',
      source: 'system',
      severity: 'warning'
    });
  });

  test.fails('画像欠落、チェック結果、週ページ、デモタイムラインのフィクスチャを提供する', async () => {
    const { createSpecLensDomainFixtures } = await loadDomainFixtures();
    const fixtures = createSpecLensDomainFixtures();

    expect(fixtures.missingScreenshotAsset.status).toBe('missing');
    expect(fixtures.failedScreenshotAsset).toMatchObject({
      status: 'failed',
      errorMessage: '写真を保存できませんでした'
    });
    expect(fixtures.checkReport.items.map((item) => item.status)).toEqual([
      'success',
      'warning',
      'failure',
      'skipped'
    ]);
    expect(fixtures.weekPage).toMatchObject({
      weekStartDate: '2026-06-15',
      weekEndDate: '2026-06-21',
      totalEvents: fixtures.weekPage.events.length
    });
    expect(fixtures.demoTimeline.sourceMode).toBe('demo');
    expect(fixtures.demoTimeline.events.some((event) => event.source === 'demo')).toBe(true);
  });
});
