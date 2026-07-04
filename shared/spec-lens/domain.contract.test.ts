import { describe, expect, test } from 'vitest';
import {
  checkItemStatuses,
  eventSeverities,
  eventSources,
  recorderStatuses,
  screenshotStatuses,
  timelineEventKinds
} from './events';
import { createSpecLensDomainFixtures } from './fixtures';

describe('SpecLens domain model contract', () => {
  test('タイムラインイベントの種別、発生元、重要度、記録状態を固定する', () => {
    expect(timelineEventKinds).toEqual([
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
    expect(eventSources).toEqual([
      'cc_sdd',
      'vite',
      'user',
      'capture',
      'check',
      'demo',
      'system'
    ]);
    expect(eventSeverities).toEqual(['info', 'success', 'warning', 'error']);
    expect(recorderStatuses).toEqual(['recording', 'paused', 'error', 'unknown']);
  });

  test('スクリーンショットとチェック結果の状態を固定する', () => {
    expect(screenshotStatuses).toEqual(['available', 'missing', 'failed']);
    expect(checkItemStatuses).toEqual(['success', 'warning', 'failure', 'skipped']);
  });

  test('後続タスクで再利用する正常、画像なし、画像保存失敗、破損イベントのフィクスチャを提供する', () => {
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

  test('画像欠落、チェック結果、週ページ、デモタイムラインのフィクスチャを提供する', () => {
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
