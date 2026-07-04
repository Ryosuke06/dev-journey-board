# Brief: spec-lens-recording

## Problem
SpecLensの価値は、ViteのHMRやcc-sddファイル更新を開発過程のイベントとして自動記録できる点にある。現行specではVite recorder、FileWatchRecorder、plugin統合、WebSocket状態が同じ大きなタスク群に含まれており、責務が広い。

## Current State
共有ドメイン型とEventStoreは存在する。Viteイベント変換、cc-sddファイル変更分類、Vite plugin統合は未着手である。

## Desired Outcome
Vite dev server中のHMR、full reload、error、cc-sdd関連ファイル変更を `TimelineEvent` に正規化し、EventStoreへ保存できる。記録停止中は保存を抑止し、状態を通知できる。

## Approach
`plugins/spec-lens/` 側へVite依存を閉じ込める。Vite hook入力とファイルwatcher入力は小さなテストダブルでRedを作り、変換処理を先に単体で実装してからplugin統合する。

## Scope
- **In**:
  - Vite HMRイベント変換
  - full reloadイベント変換
  - dev server errorイベント変換
  - `.kiro/specs/**`、`.kiro/steering/**`、必要な`.agents/**`変更の分類
  - `cc_sdd_file`、`task_state`、`verification`、未紐付けイベント生成
  - 記録状態 `recording`、`paused`、`error`、`unknown`
  - Vite pluginのdev server登録、watcher登録、WebSocket状態通知
- **Out**:
  - React UI
  - HTTP API本体
  - スクリーンショット撮影
  - ルールベースチェック
  - demo export

## Boundary Candidates
- ViteEventRecorder
- FileWatchRecorder
- SpecLensVitePlugin
- RecorderStatus publisher

## Out of Boundary
- `.kiro` の承認ワークフロー代替
- Git履歴解析
- AIによる変更内容評価
- production server対応
- Vite以外のビルドツール対応

## Upstream / Downstream
- **Upstream**: `spec-lens-timeline` のEventStore、共有ドメイン型、保存先境界
- **Downstream**: `spec-lens-local-api`、`spec-lens-ui`

## Existing Spec Touchpoints
- **Extends**: なし
- **Adjacent**: `spec-lens-timeline` の3.1から3.6をこのspecへ移す

## Constraints
- Vite、Node filesystem、WebSocket依存をUIへ漏らさない。
- build時にはdev専用処理が動かないようguardする。
- 詳細不足のViteイベントも捨てず、不明としてイベント化する。
- 外部ネットワークへイベントを送信しない。
