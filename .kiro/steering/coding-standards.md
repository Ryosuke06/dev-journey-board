# コード規約

## TypeScript

- `strict`前提で実装する。
- `any`は原則禁止する。必要な場合は理由をコメントで残し、より狭い型にできないか先に検討する。
- 失敗しうる処理は、例外を握りつぶさず、UIや呼び出し元が扱える結果として返す。
- ドメイン上ありえない状態は、union typeで表現してコンパイル時に検出できるようにする。

## バックエンド設計

- domain層には業務ルールだけを書く。ファイル保存、Playwright、Vite、HTTPなどの技術詳細を入れない。
- usecase層には「何を実行するか」を書く。HTTP requestやReact UIの都合を混ぜない。
- repositoryはdomain層でinterfaceを定義し、infrastructure層で実装する。
- usecaseはrepository interfaceやportを受け取り、具体実装はcomposition rootで注入する。
- DTOとdomain modelを混同しない。API response用の形はpresentation層で変換する。
- domain modelは永続化形式に引きずられすぎない。NDJSONの行構造はinfrastructureの関心として扱う。
- 外部依存の失敗はusecaseが扱えるResult型または明示的なエラー型へ変換する。
- 単体テストではdomain/usecaseを優先して検証し、infrastructureは境界ごとに薄くテストする。

## React

- 関数コンポーネントで実装する。
- コンポーネント名、ファイル名はPascalCaseにする。
- hookやselectorなどUI部品ではない関数はcamelCaseにする。
- propsの型はコンポーネントの近くに置く。複数ファイルで共有する型だけ専用ファイルへ移す。
- UIは表示に集中し、保存、ファイル操作、Vite plugin処理を直接持たない。

## MUI

- レイアウトと見た目はMUIコンポーネント、Theme、`sx`を優先する。
- 画面全体で共有する色、typography、影、角丸は`src/app/theme.ts`へ寄せる。
- その場限りの小さな調整は`sx`でよい。
- 複数箇所で再利用する見た目は、コンポーネント化またはtheme overrideを検討する。
- 生CSSファイルは原則追加しない。

## テスト

- TDDはRed、Green、Refactorの順で進める。
- Redでは、未実装によりテストが失敗することを確認する。
- Greenでは、テストを通すための最小実装に留める。
- Refactorでは、テストが通ったまま構造を整える。
- UIテストは実装詳細ではなく、ユーザーが見るテキスト、role、操作を優先して検証する。
- E2Eは主要なユーザー導線と起動確認に絞る。

## 命名

- イベント、DTO、保存パス、状態名は仕様書の用語に合わせる。
- booleanは`is`、`has`、`can`、`should`など意味が分かる接頭辞を使う。
- 変換関数は`toXxx`、生成関数は`createXxx`、検索や抽出は`findXxx`または`selectXxx`を使う。
- usecaseは動詞から始める。例: `recordTimelineEvent`, `getWeeklyTimeline`, `captureScreenshot`。
- repository interfaceは対象名 + `Repository`にする。例: `TimelineEventRepository`。
- infrastructure実装は技術名を含める。例: `NdjsonTimelineEventRepository`。
- テストファイルは対象に近い場所へ`*.test.ts`または`*.test.tsx`として置く。

## コメント

- コードを読めば分かるコメントは書かない。
- 境界、設計判断、エラー処理の意図など、後から迷いやすい理由だけ短く書く。
- TODOを残す場合は、対応するタスク番号または理由を明記する。

## Git

- タスク単位で小さくコミットする。
- `git add .`は使わず、対象ファイルを明示してstageする。
- 生成物、`node_modules/`、`.spec-lens/`、`dist/`、`test-results/`はコミットしない。
