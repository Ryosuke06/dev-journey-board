# Brief: spec-lens-demo-data

## Problem
発表当日にライブ記録だけへ依存すると不安定である。発表で見せる固定データをライブ記録と分けて持つ必要があるが、現行specでは保存境界、画像コピー、demo mode、UI切替が混在している。

## Current State
`demo-data/spec-lens/` の保存先境界と `DemoTimeline` 型は存在する。実際のexport、画像コピー、demo mode load、欠落画像耐性は未着手である。

## Desired Outcome
選択したライブイベントと関連画像を `demo-data/spec-lens/` に分離し、demo modeで読み込める。画像欠落があっても他イベントを閲覧でき、ライブ記録を誤って上書きしない。

## Approach
DemoDataManagerをEventStoreとは別のデモデータ境界として作る。ライブ記録の読み取り、選択イベントのexport、関連画像コピー、demo mode loadを明示的に分ける。

## Scope
- **In**:
  - 選択イベントexport
  - 関連スクリーンショットコピー
  - `demo-data/spec-lens/events.sample.ndjson`
  - `demo-data/spec-lens/screenshots/`
  - demo mode load
  - 欠落画像をmissing状態として扱う
  - ライブ記録非上書き
- **Out**:
  - React UI切替
  - HTTP API endpoint
  - クラウド配布
  - 複数リポジトリのデモ統合

## Boundary Candidates
- DemoDataManager
- DemoDataRepository
- DemoExportRequest / DemoExportResult
- DemoTimeline loader

## Out of Boundary
- ライブ記録の上書き
- 外部ストレージ配布
- 発表スライド生成
- UIの表示モード切替コンポーネント

## Upstream / Downstream
- **Upstream**: `spec-lens-timeline` のEventStore、`spec-lens-capture-check` のScreenshotAsset
- **Downstream**: `spec-lens-local-api`、`spec-lens-ui`

## Existing Spec Touchpoints
- **Extends**: なし
- **Adjacent**: `spec-lens-timeline` の4.5、4.6をこのspecへ移す

## Constraints
- `demo-data/spec-lens/` と `.spec-lens/` を混ぜない。
- 欠落画像があってもイベント読込を止めない。
- demo modeではライブ記録へ書き込まない。
- export対象の任意パス書き込みを許可しない。
