import type {
  CheckReport,
  DemoTimeline,
  RecorderStatus,
  ScreenshotAsset,
  TimelineEvent,
  WeekPageResponse
} from './events';

export interface SpecLensDomainFixtureSet {
  readonly normalEvent: TimelineEvent;
  readonly eventWithoutScreenshot: TimelineEvent;
  readonly captureFailedEvent: TimelineEvent;
  readonly corruptEvent: TimelineEvent;
  readonly screenshotAsset: ScreenshotAsset;
  readonly missingScreenshotAsset: ScreenshotAsset;
  readonly failedScreenshotAsset: ScreenshotAsset;
  readonly checkReport: CheckReport;
  readonly weekPage: WeekPageResponse;
  readonly demoTimeline: DemoTimeline;
  readonly recorderStatuses: readonly RecorderStatus[];
}

export function createSpecLensDomainFixtures(): SpecLensDomainFixtureSet {
  const normalEvent: TimelineEvent = {
    id: 'evt-2026-06-15-cc-sdd-requirements',
    schemaVersion: 1,
    kind: 'cc_sdd_file',
    occurredAt: '2026-06-15T09:00:00.000+09:00',
    source: 'cc_sdd',
    severity: 'info',
    title: 'requirements.mdを更新',
    summary: 'SpecLens Timelineの受け入れ条件を更新した。',
    relatedPaths: ['.kiro/specs/spec-lens-timeline/requirements.md'],
    specRef: 'spec-lens-timeline',
    taskRef: '1.5',
    screenshotIds: ['shot-2026-06-15-requirements'],
    marker: 'important',
    payload: {
      changeKind: 'updated',
      fileRole: 'requirements'
    }
  };

  const eventWithoutScreenshot: TimelineEvent = {
    id: 'evt-2026-06-15-task-state',
    schemaVersion: 1,
    kind: 'task_state',
    occurredAt: '2026-06-15T10:00:00.000+09:00',
    source: 'cc_sdd',
    severity: 'success',
    title: 'タスク1.4をRedとして固定',
    summary: '共有ドメイン型の期待を失敗テストで固定した。',
    relatedPaths: ['.kiro/specs/spec-lens-timeline/tasks.md'],
    specRef: 'spec-lens-timeline',
    taskRef: '1.4',
    screenshotIds: [],
    payload: {
      fromStatus: 'todo',
      toStatus: 'red'
    }
  };

  const captureFailedEvent: TimelineEvent = {
    id: 'evt-2026-06-15-capture-failed',
    schemaVersion: 1,
    kind: 'screenshot',
    occurredAt: '2026-06-15T10:30:00.000+09:00',
    source: 'capture',
    severity: 'error',
    title: 'スクリーンショット保存に失敗',
    summary: '写真を保存できませんでした',
    relatedPaths: ['src/App.tsx'],
    taskRef: '4.1',
    screenshotIds: ['shot-2026-06-15-capture-failed'],
    payload: {
      targetUrl: 'http://localhost:5173',
      reason: 'write_failed'
    }
  };

  const corruptEvent: TimelineEvent = {
    id: 'evt-2026-06-15-corrupt-line-12',
    schemaVersion: 1,
    kind: 'corrupt',
    occurredAt: '2026-06-15T11:00:00.000+09:00',
    source: 'system',
    severity: 'warning',
    title: '破損したイベント行を隔離',
    summary: '読み取れないNDJSON行を破損イベントとして扱った。',
    relatedPaths: ['.spec-lens/events.ndjson'],
    screenshotIds: [],
    payload: {
      lineNumber: 12,
      rawLine: '{broken',
      reason: 'invalid_json'
    }
  };

  const demoMarkerEvent: TimelineEvent = {
    id: 'evt-2026-06-16-demo-marker',
    schemaVersion: 1,
    kind: 'demo_marker',
    occurredAt: '2026-06-16T09:00:00.000+09:00',
    source: 'demo',
    severity: 'success',
    title: '発表用デモに採用',
    summary: 'ライトニングトークで見せる流れとして固定した。',
    relatedPaths: ['demo-data/spec-lens/events.sample.ndjson'],
    specRef: 'spec-lens-timeline',
    screenshotIds: ['shot-2026-06-16-demo-missing'],
    marker: 'presentation',
    payload: {
      exportName: 'vite-conf-lt'
    }
  };

  const screenshotAsset: ScreenshotAsset = {
    id: 'shot-2026-06-15-requirements',
    eventId: normalEvent.id,
    path: '.spec-lens/screenshots/2026-06-15/shot-2026-06-15-requirements.png',
    capturedAt: '2026-06-15T09:00:05.000+09:00',
    width: 1440,
    height: 900,
    status: 'available'
  };

  const missingScreenshotAsset: ScreenshotAsset = {
    id: 'shot-2026-06-16-demo-missing',
    eventId: demoMarkerEvent.id,
    path: 'demo-data/spec-lens/screenshots/shot-2026-06-16-demo-missing.png',
    capturedAt: '2026-06-16T09:00:05.000+09:00',
    status: 'missing',
    errorMessage: '写真が見つかりませんでした'
  };

  const failedScreenshotAsset: ScreenshotAsset = {
    id: 'shot-2026-06-15-capture-failed',
    eventId: captureFailedEvent.id,
    path: '.spec-lens/screenshots/2026-06-15/shot-2026-06-15-capture-failed.png',
    capturedAt: '2026-06-15T10:30:05.000+09:00',
    status: 'failed',
    errorMessage: '写真を保存できませんでした'
  };

  const checkReport: CheckReport = {
    id: 'check-2026-06-15-rule-summary',
    eventId: normalEvent.id,
    runAt: '2026-06-15T11:30:00.000+09:00',
    items: [
      {
        id: 'check-requirements-approved',
        label: 'requirementsが承認済み',
        status: 'success',
        reason: 'requirements approvalがtrueである。',
        relatedPaths: ['.kiro/specs/spec-lens-timeline/spec.json']
      },
      {
        id: 'check-task-detail',
        label: 'タスクに背景がある',
        status: 'warning',
        reason: '一部タスクは背景の説明を追加すると読みやすい。',
        relatedPaths: ['.kiro/specs/spec-lens-timeline/tasks.md']
      },
      {
        id: 'check-validation-run',
        label: '検証が実行済み',
        status: 'failure',
        reason: '最新の実装に対する検証結果がまだ記録されていない。',
        relatedPaths: []
      },
      {
        id: 'check-demo-data',
        label: 'デモデータが存在する',
        status: 'skipped',
        reason: 'デモデータ作成前のため対象なし。',
        relatedPaths: []
      }
    ]
  };

  const weekEvents = [
    normalEvent,
    eventWithoutScreenshot,
    captureFailedEvent,
    corruptEvent,
    demoMarkerEvent
  ] as const;

  const weekPage: WeekPageResponse = {
    weekStartDate: '2026-06-15',
    weekEndDate: '2026-06-21',
    previousWeekStartDate: '2026-06-08',
    nextWeekStartDate: '2026-06-22',
    totalEvents: weekEvents.length,
    events: weekEvents,
    summary: {
      eventCount: weekEvents.length,
      screenshotCount: 3,
      errorCount: 1,
      failedCheckCount: 1
    }
  };

  const demoTimeline: DemoTimeline = {
    id: 'demo-vite-conf-lt',
    sourceMode: 'demo',
    exportedAt: '2026-06-16T09:05:00.000+09:00',
    events: [normalEvent, demoMarkerEvent],
    screenshots: [screenshotAsset, missingScreenshotAsset]
  };

  return {
    normalEvent,
    eventWithoutScreenshot,
    captureFailedEvent,
    corruptEvent,
    screenshotAsset,
    missingScreenshotAsset,
    failedScreenshotAsset,
    checkReport,
    weekPage,
    demoTimeline,
    recorderStatuses: ['recording', 'paused', 'error', 'unknown']
  };
}
