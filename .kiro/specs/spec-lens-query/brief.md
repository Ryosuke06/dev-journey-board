# Brief: spec-lens-query

## Problem
発表者は、保存された開発イベント全体ではなく、週単位の流れ、検索結果、重要マーカーを見たい。現行の巨大specではEventStore、検索、UI、APIが混ざっており、クエリ層だけを安全に育てにくい。

## Current State
`spec-lens-timeline` で共有ドメイン型、保存先境界、EventStoreの最小実装まで完了している。週単位ページングと検索は未着手で、現在のtasks.mdでは2.3以降に含まれている。

## Desired Outcome
EventStoreから読み込んだ `TimelineEvent` を、週単位ページ、前週/次週、サマリー、検索、種別フィルタ、重要マーカーで取得できる。

## Approach
`plugins/spec-lens/server/` 配下にクエリ用usecaseまたはdomain serviceを置き、EventStoreから得たイベントをUI/API向けに整形する。画像ファイルの実読込は扱わず、テキスト情報を先に返せるDTOにする。

## Scope
- **In**:
  - 月曜始まりの週範囲計算
  - 指定週、前週、次週のページ情報
  - 発生時刻順の並び替え
  - title、summary、kind、relatedPaths、taskRef、specRefの検索
  - kind、marker、live/demo表示元の絞り込み
  - 週サマリーの算出
- **Out**:
  - React UI表示
  - HTTP API
  - 画像ファイル実読込
  - Vite plugin統合
  - demo export本体

## Boundary Candidates
- TimelineQueryService
- WeekRange / week calculation
- TimelineSearchCriteria
- WeekPageResponse DTO

## Out of Boundary
- UI componentの状態管理
- LocalApiRouterのrequest/response処理
- EventStoreの保存形式変更
- スクリーンショット保存

## Upstream / Downstream
- **Upstream**: `spec-lens-timeline` の共有ドメイン型とEventStore
- **Downstream**: `spec-lens-local-api`、`spec-lens-ui`

## Existing Spec Touchpoints
- **Extends**: なし
- **Adjacent**: `spec-lens-timeline` の2.3、2.4をこのspecへ移す

## Constraints
- 週境界は月曜始まりで固定する。
- タイムゾーン差でテストが不安定にならないよう固定時刻のテストを使う。
- 画像読み込みを待たずにテキスト情報を返す。
- EventStoreの保存形式をこのspecで変更しない。
