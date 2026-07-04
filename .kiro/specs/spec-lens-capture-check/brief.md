# Brief: spec-lens-capture-check

## Problem
発表では文字ログだけでは開発過程を説明しにくい。スクリーンショットとルールベース簡易チェックが必要だが、Playwright依存、ファイル保存、チェックロジックが現行specに混在している。

## Current State
`ScreenshotAsset` と `CheckReport` の共有型、EventStoreは存在する。Playwrightによる撮影、画像保存失敗時の状態化、ルールベースチェック生成は未着手である。

## Desired Outcome
成功時はPNG参照と `screenshot` イベント、失敗時は「写真を保存できませんでした」を表示できる状態を残す。ルールベースチェックは成功、警告、失敗、スキップ、理由、関連パスを持つ `CheckReport` を生成する。

## Approach
Playwrightやfilesystemはinfrastructure境界に置き、テストでは差し替え可能なportを使う。RuleCheckEngineはAI採点ではなく、仕様ファイル有無、未完了タスク、検証未実施などの説明可能なルールに限定する。

## Scope
- **In**:
  - ScreenshotCaptureAgentの契約
  - capture成功時のPNG保存と`screenshot`イベント生成
  - Playwright起動失敗、対象URL未設定、画像書き込み失敗のResult化
  - 元イベントを壊さない失敗記録
  - RuleCheckEngine
  - CheckReportとcheck_resultイベント生成
  - 対象なしを`skipped`として扱うルール
- **Out**:
  - React UI表示
  - HTTP API endpoint
  - demo export
  - 外部AI評価
  - コード品質スコアリング

## Boundary Candidates
- ScreenshotCaptureAgent
- ScreenshotAssetRepository
- RuleCheckEngine
- CheckReportFactory

## Out of Boundary
- ブラウザ内DOMキャプチャ
- 動画録画
- 過去バージョンの完全再実行
- AI採点
- 外部APIレビュー

## Upstream / Downstream
- **Upstream**: `spec-lens-timeline` のEventStore、共有ドメイン型、保存先境界
- **Downstream**: `spec-lens-demo-data`、`spec-lens-local-api`、`spec-lens-ui`

## Existing Spec Touchpoints
- **Extends**: なし
- **Adjacent**: `spec-lens-timeline` の4.1から4.4をこのspecへ移す

## Constraints
- Playwright依存はテストで差し替え可能にする。
- 画像が保存できなくてもイベント閲覧を継続できる状態を返す。
- UIに渡す文言は「ルールベースチェック」として扱う。
- 外部サービスへ画像やイベントを送信しない。
