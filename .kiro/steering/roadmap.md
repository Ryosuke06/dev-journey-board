# Roadmap

## Overview
SpecLensは、cc-sddでの開発過程をローカルに記録し、Viteカンファレンスで説明しやすい週単位タイムラインとして見せるReact/Viteアプリである。

現行の `spec-lens-timeline` は、React/Vite基盤、共有ドメイン型、保存パス、EventStore、Vite plugin、Capture、Check、Demo、API、UIまで含んでおり、1つのspecとしては大きすぎる。以後は、既存specを基盤とEventStoreに縮小し、未着手領域を独立したspecへ分割する。

## Approach Decision
- **Chosen**: 既存specを基盤specとして残し、自然な責務境界ごとに新specを作る
- **Why**: すでに `spec-lens-timeline` で1.1から2.2まで実装済みのため、履歴を壊さずに未着手領域だけを切り出せる。依存関係も `EventStore -> Query/Recording/Capture -> API -> UI` と明確になる。
- **Rejected alternatives**: すべてを最初から新specへ作り直す案は、完了済みタスク履歴とコミット履歴を無駄にする。UI単位だけで分割する案は、Vite plugin、Capture、Check、APIの境界が曖昧になる。

## Scope
- **In**:
  - ローカル開発イベントの記録と保存
  - 週単位タイムライン取得、検索、フィルタ
  - Vite開発イベントとcc-sddファイル変更の記録入口
  - スクリーンショット保存とルールベース簡易チェック
  - 発表用デモデータのexport/load
  - Vite dev server内のローカルAPI
  - React SPAによるタイムライン閲覧と操作
- **Out**:
  - クラウド同期、共有URL、ログイン、チーム権限
  - 外部サービス送信
  - 過去バージョンの完全な実行再現
  - AIによる品質採点
  - 複数リポジトリ横断分析

## Constraints
- React 19.2系、Vite 8系、TypeScript 5系を維持する。
- UIはMUIを優先し、生CSSは原則追加しない。
- バックエンド側はDDDを意識し、`domain`、`usecases`、`infrastructure`、`presentation` の責務を分ける。
- `.kiro/specs/` は仕様文書、`.spec-lens/` は実行時生成データ、`demo-data/spec-lens/` は発表用固定データとして分離する。
- 初期版はローカル完結とし、イベントや画像を外部送信しない。
- 各specはTDDで進め、Red/Green/Refactorをタスク単位で明示する。

## Boundary Strategy
- **Why this split**: EventStore、Query、Recording、Capture/Check、Demo、API、UIは変更理由と依存方向が異なる。分けることで、1つのspecが肥大化せず、レビューと実装コミットを小さく保てる。
- **Shared seams to watch**:
  - `shared/spec-lens/events.ts` の `TimelineEvent`、`ScreenshotAsset`、`CheckReport`
  - `plugins/spec-lens/server/eventStore.ts` の保存・読込契約
  - `.spec-lens/` と `demo-data/spec-lens/` の保存境界
  - Local API response DTOとReact UI selectorの境界
  - Vite/Playwright/Node filesystem依存をUIへ漏らさないこと

## Existing Spec Updates
- [ ] spec-lens-timeline -- 既存specをReact/Vite基盤、共有ドメイン型、保存先境界、EventStoreまでに縮小し、2.3以降の未着手タスクを新specへ移す。 Dependencies: none

## Direct Implementation Candidates
- [ ] none -- 現時点では直接実装に落とす小作業はなく、未着手の大きな領域はspec化する。

## Specs (dependency order)
- [ ] spec-lens-query -- EventStoreから週単位ページ、検索、フィルタ、重要マーカーを取得するクエリ層を作る。 Dependencies: spec-lens-timeline
- [ ] spec-lens-recording -- Vite HMR、reload、dev server error、cc-sddファイル変更をTimelineEventへ変換し、Vite pluginに統合する。 Dependencies: spec-lens-timeline
- [ ] spec-lens-capture-check -- Playwrightスクリーンショット保存とルールベース簡易チェックをローカルサービスとして作る。 Dependencies: spec-lens-timeline
- [ ] spec-lens-demo-data -- ライブ記録から発表用固定データをexportし、欠落画像に耐えてdemo modeで読み込む。 Dependencies: spec-lens-timeline, spec-lens-capture-check
- [ ] spec-lens-local-api -- React UIから使うローカルHTTP APIとWebSocket状態通知を提供する。 Dependencies: spec-lens-query, spec-lens-recording, spec-lens-capture-check, spec-lens-demo-data
- [ ] spec-lens-ui -- 週単位タイムライン、詳細、スクリーンショット、チェック、デモ切替、記録状態をReact SPAで表示・操作する。 Dependencies: spec-lens-local-api
- [ ] spec-lens-integration-hardening -- Vite設定統合、WebSocketライブ更新、ローカル開発E2E、性能とローカル専用制約を仕上げる。 Dependencies: spec-lens-ui, spec-lens-recording, spec-lens-local-api
