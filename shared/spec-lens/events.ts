export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
export type JsonObject = { readonly [key: string]: JsonValue };

export const timelineEventKinds = [
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
] as const;

export const eventSources = [
  'cc_sdd',
  'vite',
  'user',
  'capture',
  'check',
  'demo',
  'system'
] as const;
export const eventSeverities = ['info', 'success', 'warning', 'error'] as const;
export const screenshotStatuses = ['available', 'missing', 'failed'] as const;
export const checkItemStatuses = ['success', 'warning', 'failure', 'skipped'] as const;
export const recorderStatuses = ['recording', 'paused', 'error', 'unknown'] as const;

export type TimelineEventKind = (typeof timelineEventKinds)[number];
export type EventSource = (typeof eventSources)[number];
export type EventSeverity = (typeof eventSeverities)[number];
export type ScreenshotStatus = (typeof screenshotStatuses)[number];
export type CheckItemStatus = (typeof checkItemStatuses)[number];
export type RecorderStatus = (typeof recorderStatuses)[number];
export type TimelineMarker = 'presentation' | 'important';
export type TimelineSourceMode = 'live' | 'demo';

export interface TimelineEvent<TPayload extends JsonObject = JsonObject> {
  readonly id: string;
  readonly schemaVersion: 1;
  readonly kind: TimelineEventKind;
  readonly occurredAt: string;
  readonly source: EventSource;
  readonly severity: EventSeverity;
  readonly title: string;
  readonly summary?: string;
  readonly relatedPaths: readonly string[];
  readonly specRef?: string;
  readonly taskRef?: string;
  readonly screenshotIds: readonly string[];
  readonly marker?: TimelineMarker;
  readonly payload: TPayload;
}

export interface ScreenshotAsset {
  readonly id: string;
  readonly eventId: string;
  readonly path: string;
  readonly capturedAt: string;
  readonly width?: number;
  readonly height?: number;
  readonly status: ScreenshotStatus;
  readonly errorMessage?: string;
}

export interface CheckReport {
  readonly id: string;
  readonly eventId: string;
  readonly runAt: string;
  readonly items: readonly CheckItem[];
}

export interface CheckItem {
  readonly id: string;
  readonly label: string;
  readonly status: CheckItemStatus;
  readonly reason: string;
  readonly relatedPaths: readonly string[];
}

export interface WeekSummary {
  readonly eventCount: number;
  readonly screenshotCount: number;
  readonly errorCount: number;
  readonly failedCheckCount: number;
}

export interface WeekPageQuery {
  readonly weekStartDate: string;
  readonly timezone: string;
  readonly kinds: readonly TimelineEventKind[];
  readonly searchText?: string;
  readonly markerOnly: boolean;
  readonly sourceMode: TimelineSourceMode;
}

export interface WeekPageResponse {
  readonly weekStartDate: string;
  readonly weekEndDate: string;
  readonly previousWeekStartDate: string;
  readonly nextWeekStartDate: string;
  readonly totalEvents: number;
  readonly events: readonly TimelineEvent[];
  readonly summary: WeekSummary;
}

export interface DemoTimeline {
  readonly id: string;
  readonly sourceMode: 'demo';
  readonly exportedAt: string;
  readonly events: readonly TimelineEvent[];
  readonly screenshots: readonly ScreenshotAsset[];
}
