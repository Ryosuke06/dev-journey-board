# ドメインモデル方針

## 目的

SpecLens Timelineのドメインモデルは、cc-sddとVite開発中に発生した出来事を、発表者があとから安全に見返せる形で表現するための中核である。

ここでいうドメインモデルは、画面表示用DTOでも、NDJSONの保存行でも、HTTP responseでもない。アプリが扱う概念、ルール、状態遷移をTypeScriptの型と関数で表現したものを指す。

## 現時点の注意

- 現在の実装はReact/Vite起動基盤のみで、ドメインモデル、usecase層、repository層はまだ存在しない。
- この文書は、今後 `plugins/spec-lens/server/` と `shared/spec-lens/` を実装するときの判断基準である。
- 承認済み `design.md` のコンポーネント名は維持しつつ、実装時にはDDDレイヤーへ配置し直す。

## ドメインモデルと他の型の違い

| 種類 | 役割 | 置き場所の目安 |
|---|---|---|
| Domain Model | 業務概念、ルール、状態を表す | `plugins/spec-lens/server/domain/` または共有が必要なら `shared/spec-lens/` |
| DTO | APIやUIへ渡すためのデータ形状 | `presentation/`、`src/features/*/*Types.ts` |
| Persistence Record | NDJSONやmanifestなど保存形式に合わせた形 | `infrastructure/` |
| View Model | UI表示しやすい形に整えたデータ | `src/features/*/*Selectors.ts` |
| Test Fixture | テスト用の固定データ | 対象テスト近く、または `test/fixtures/` |

Domain ModelをDTOやPersistence Recordに寄せすぎると、保存形式や画面都合が業務ルールへ漏れる。変換はusecaseまたはpresentation/infrastructureの境界で行う。

## 中核概念

### TimelineEvent

開発過程で起きた1つの出来事を表す中心モデル。

保持する責務:

- 発生時刻
- イベント種別
- タイトルまたは概要
- 関連パス
- 関連する仕様、タスク、検証結果
- スクリーンショット参照
- 重要マーカー
- 破損、欠落、失敗などの表示継続に必要な状態

守るルール:

- イベントはappend-onlyで扱い、過去イベントを安易に破壊的更新しない。
- 仕様やタスクに紐付かないイベントも有効なイベントとして扱う。
- 一部の情報が不足しても、イベント全体を捨てずに「不明」「未紐付け」「欠落」として表現する。
- 読み取れない保存行は、表示不能な例外ではなく、破損イベントとして隔離する。

### TimelineEventKind

イベントの種類を表すunion type。

初期候補:

- `cc_sdd_file_changed`
- `task_status_changed`
- `validation_result`
- `decision`
- `vite_hmr`
- `vite_reload`
- `vite_error`
- `screenshot`
- `check_result`
- `corrupt_record`

種別は文字列の自由入力にしない。表示名はUI側で変換し、domainでは安定した識別子として扱う。

### ScreenshotAsset

スクリーンショット画像と、その利用状態を表すモデル。

保持する責務:

- 画像ID
- 保存先への相対参照
- キャプチャ対象URL
- 作成時刻
- 保存状態
- 失敗理由または欠落理由

守るルール:

- 画像がなくてもTimelineEventの詳細表示は止めない。
- 保存失敗はイベントから消さず、ユーザーへ説明できる状態として残す。
- domainではPNGの実バイト列を持たない。ファイル書き込みや存在確認はinfrastructureの責務にする。

### CheckReport

ルールベース簡易チェックの結果を表すモデル。

保持する責務:

- チェック実行時刻
- チェック項目
- 結果状態
- 判定理由
- 関連パスまたは関連タスク

状態候補:

- `passed`
- `warning`
- `failed`
- `skipped`

守るルール:

- 対象がない場合は失敗ではなく`skipped`として扱う。
- AI採点や品質スコアではなく、説明可能なルールベース結果として扱う。

### TimelineWeek

週単位でタイムラインを閲覧するための期間モデル。

保持する責務:

- 週開始日
- 週終了日
- 前週、次週への移動情報
- 週内イベント数や種別別サマリー

守るルール:

- 週境界は月曜始まりで固定する。
- タイムゾーン差でテストが不安定にならないよう、時刻計算は固定時刻のテストで検証する。

### RecorderStatus

記録機能の現在状態を表すモデル。

状態候補:

- `recording`
- `paused`
- `error`

守るルール:

- 停止中は新しい開発サーバーイベントを保存しない。
- エラー中でも既存タイムラインの閲覧は継続できるようにする。

### DemoTimeline

発表用に固定されたサンプルタイムラインを表すモデル。

保持する責務:

- デモデータID
- 選択されたイベント
- 関連スクリーンショット参照
- ライブ記録ではなくデモ表示中であることを示す情報

守るルール:

- ライブ記録と発表用データを混ぜない。
- 欠落画像があっても他イベントの閲覧を継続する。
- demo modeではライブ記録を誤って上書きしない。

## Value Object候補

Value Objectは、文字列やDateをそのまま渡すと意味が曖昧になるものに使う。

| Value Object | 目的 |
|---|---|
| `TimelineEventId` | イベントIDであることを明示する |
| `ScreenshotAssetId` | スクリーンショットIDであることを明示する |
| `ProjectRelativePath` | project root配下の相対パスだけを表す |
| `SpecRef` | 関連仕様を表す |
| `TaskRef` | 関連タスクを表す |
| `OccurredAt` | イベント発生時刻を表す |
| `WeekRange` | 月曜始まりの週範囲を表す |
| `SearchKeyword` | 空文字や正規化済み検索語を扱う |

Value Objectでは、作成時に不正値を弾く。例として、絶対パスやproject root外参照は`ProjectRelativePath`として作成できないようにする。

## EntityとAggregateの考え方

初期実装では過度にAggregateを増やさない。

- `TimelineEvent`はIDを持つEntityとして扱う。
- `ScreenshotAsset`もIDを持つEntityとして扱う。
- `CheckReport`はイベントに紐付くEntityまたはValue Objectとして開始し、複雑化したら独立Entityへ分ける。
- `TimelineWeek`は保存対象ではなく、クエリ結果を組み立てるためのモデルとして扱う。

Aggregate rootは、永続化境界や不変条件が明確になってから導入する。最初から大きなAggregateを作らない。

## Repository interface候補

Repository interfaceはdomain層に置き、具体実装はinfrastructure層に置く。

```ts
export interface TimelineEventRepository {
  append(event: TimelineEvent): Promise<Result<void, TimelineEventAppendError>>;
  listByWeek(range: WeekRange): Promise<Result<TimelineEvent[], TimelineEventReadError>>;
}
```

実装例:

- `NdjsonTimelineEventRepository`
- `FileSystemScreenshotAssetRepository`
- `DemoDataTimelineRepository`

Repositoryは保存形式の詳細を外へ漏らさない。NDJSONの破損行、ファイル書き込み失敗、画像欠落などは、domain/usecaseが扱えるエラー型または状態へ変換する。

## Usecase候補

Usecaseは「ユーザーまたはシステムが実行する操作」を表す。

候補:

- `recordTimelineEvent`
- `recordViteEvent`
- `recordFileChange`
- `getWeeklyTimeline`
- `searchTimelineEvents`
- `captureScreenshot`
- `runRuleCheck`
- `recordDecision`
- `exportDemoTimeline`
- `loadDemoTimeline`

Usecaseはdomain modelとrepository interfaceを使う。HTTP request、WebSocket payload、Vite hook入力、Playwright page objectを直接受け取らない。presentationまたはinfrastructureで変換してからusecaseへ渡す。

## 実装時の判断ルール

- 仕様上の言葉として重要ならdomain modelにする。
- 画面表示の都合だけならView Modelにする。
- APIの入出力形状だけならDTOにする。
- 保存形式の都合だけならPersistence Recordにする。
- 外部ライブラリの型をdomainへ持ち込まない。
- domain modelのテストは、ファイルシステムやVite dev serverなしで実行できるようにする。
