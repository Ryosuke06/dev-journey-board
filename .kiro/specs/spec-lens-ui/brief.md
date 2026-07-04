# Brief: spec-lens-ui

## Problem
発表者は、週単位のタイムライン、イベント詳細、スクリーンショット、チェック結果、デモ切替、記録状態をブラウザで操作したい。現行specではUIがAPI、server、保存層と混ざっており、UIだけのTDDとレビューがしにくい。

## Current State
React/Vite/MUIの基盤は存在する。UIはAppShellの起動確認までで、タイムライン画面、selector、API client、詳細表示、操作群は未着手である。

## Desired Outcome
React SPAで現在週、前週、次週、空状態、検索、種別フィルタ、週サマリー、イベント詳細、画像あり/なし/欠落/保存失敗、意思決定、手動capture、重要マーカー、チェック、demo切替、記録状態を扱える。

## Approach
UIはLocal API clientと型付きDTOだけに依存する。server実装やEventStoreを直接importしない。MUIコンポーネントとThemeを使い、生CSSは追加しない。

## Scope
- **In**:
  - TimelineApiClient
  - timelineSelectors
  - TimelinePage
  - TimelineWeekPager
  - WeekSummaryHeader
  - TimelineFilters
  - TimelineList
  - EventDetailPanel
  - ScreenshotPreview
  - CheckPanel
  - DemoDataSwitcher
  - RecorderStatusBadge
  - 非対応範囲説明
- **Out**:
  - Local API実装
  - EventStore直接参照
  - Vite plugin処理
  - Playwright撮影処理
  - server側のcheck/demo判定ロジック

## Boundary Candidates
- Timeline API client
- Timeline selectors
- Timeline UI components
- Check UI
- DemoData UI
- RecorderStatus UI

## Out of Boundary
- server実装の直接import
- ファイル操作
- Vite plugin登録
- API route定義
- 共有リンク生成
- チーム権限UI

## Upstream / Downstream
- **Upstream**: `spec-lens-local-api`
- **Downstream**: 発表用デモ、将来のチームレビューUI

## Existing Spec Touchpoints
- **Extends**: なし
- **Adjacent**: `spec-lens-timeline` の6.1から6.8をこのspecへ移す

## Constraints
- MUIを優先し、生CSSは原則追加しない。
- UIテストはユーザーが見る文字、role、操作を優先する。
- 画像読み込み中でもテキスト情報を先に表示する。
- demo modeではライブ記録へ誤って書き込む操作を抑制する。
