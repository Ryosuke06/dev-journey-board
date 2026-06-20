# Research & Design Decisions: spec-lens-timeline

## Summary
- **Feature**: `spec-lens-timeline`
- **Discovery Scope**: New Feature / Complex Integration
- **Key Findings**:
  - Vite Plugin APIは`configureServer`、`handleHotUpdate`、`transformIndexHtml`、`server.ws`を使って、ローカル開発中のイベント観測とクライアント連携を実装できる。
  - スクリーンショット自動保存はブラウザ内JavaScriptだけでは制約が大きいため、MVPではPlaywrightをローカルCapture Agentとして使う設計にする。
  - 仕様Markdownと生成ログを同じ場所に置くと肥大化するため、Project Memoryは`.kiro/specs/spec-lens-timeline/`、実行時データは`.spec-lens/`、発表用固定データは`demo-data/spec-lens/`に分離する。

## Research Log

### Vite Plugin APIで記録基盤を作れるか
- **Context**: Vite開発イベント、HMR、ファイル変更をタイムラインへ記録する必要がある。
- **Sources Consulted**:
  - [Vite Plugin API](https://vite.dev/guide/api-plugin.html)
  - [Vite HMR API](https://vite.dev/guide/api-hmr.html)
- **Findings**:
  - Vite 8 docsはPlugin APIをVite固有の拡張を含むプラグインインターフェースとして説明している。
  - `configureServer`でdev serverのmiddleware、WebSocket、watcher、module graphへアクセスできる。
  - `handleHotUpdate`は変更ファイル、影響モジュール、timestampを受け取り、HMRの詳細記録に使える。
  - `server.ws.send`と`import.meta.hot.on`/`send`で、サーバーとブラウザ間のカスタムイベントを交換できる。
- **Implications**:
  - SpecLensの記録入口はViteプラグインに置く。
  - UIと記録サーバーは同じVite dev server上でローカルAPIとして接続する。
  - カスタムイベント名は`spec-lens:*`で名前空間を切る。

### スクリーンショット保存方式
- **Context**: 重要イベント時と手動操作時に画面状態を保存する必要がある。
- **Sources Consulted**:
  - [Playwright Screenshots](https://playwright.dev/docs/screenshots)
- **Findings**:
  - Playwrightはページ、フルページ、要素単位のスクリーンショット保存を公式にサポートしている。
  - ブラウザ内ライブラリでDOMを画像化する方式は、canvas、外部画像、フォント、WebGLなどで再現性が落ちやすい。
  - ブラウザ標準の画面共有APIはユーザー許可が必要で、自動保存体験には向かない。
- **Implications**:
  - MVPではPlaywrightをローカルCapture Agentとして採用する。
  - Capture Agentが利用できない場合もイベント記録は継続し、スクリーンショット失敗イベントを残す。
  - 完全な過去実行再現ではなく、時点ごとの画像とイベント詳細で説明可能にする。

### React/Vite UIの前提
- **Context**: タイムラインUI、検索、フィルタ、詳細表示、スクリーンショットプレビューが必要。
- **Sources Consulted**:
  - [React Blog](https://react.dev/blog)
  - [Vite Plugin API](https://vite.dev/guide/api-plugin.html)
- **Findings**:
  - React公式ブログはReact 19.2系を現在の主要バージョンとして示している。
  - Vite 8 docsはv8.0.16を表示しており、Rolldown powered Viteのメタ情報もPlugin APIで扱える。
- **Implications**:
  - UIはReact 19.2系 + TypeScript + Vite 8系で設計する。
  - 初期版はSSRやServer Componentsを使わず、ローカルSPAとして実装する。

### 既存コードベースの状態
- **Context**: 既存実装がある場合は統合設計が必要だが、現在はグリーンフィールド。
- **Sources Consulted**:
  - `package.json`
  - `.kiro/specs/spec-lens-timeline/requirements.md`
  - ルートディレクトリ構成
- **Findings**:
  - React/Viteアプリ本体の`src/`、`vite.config.ts`、`index.html`はまだ存在しない。
  - `.agents/`、`.kiro/settings/`、`.codex/`はcc-sdd/Codex基盤として存在する。
  - `.kiro/steering/`はまだ存在しない。
- **Implications**:
  - designは新規アプリのファイル構成を具体化する。
  - steering欠如による制約不足は、設計内のBoundary CommitmentsとFile Structure Planで補う。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Vite plugin centered local tool | Vite dev server pluginがイベント収集、ローカルAPI、WebSocket、ファイル保存を担い、React UIが閲覧する | Viteの技術価値がアプリ価値に直結する。ローカル完結しやすい | Vite dev server依存が強い | 採用 |
| Standalone Node server plus React app | 別Nodeサーバーを起動し、Viteとは独立して記録する | Vite以外にも拡張しやすい | 発表テーマとしてVite色が弱く、起動手順が増える | 不採用 |
| Git log plus Markdown only | アプリを作らず、Gitとドキュメントだけで開発過程を整理する | 最小構成で実装不要 | 完成アプリとしてのデモ価値が弱い | 今回の方針とは不一致 |
| Browser DOM capture only | ブラウザ内スクリプトで画面を画像化する | 依存が少ない | 再現性と自動保存の信頼性が低い | 補助案として保留 |

## Design Decisions

### Decision: Vite Pluginを記録入口にする
- **Context**: ViteのHMR、フルリロード、エラー、ファイル更新をタイムラインへ統合する必要がある。
- **Alternatives Considered**:
  1. Standalone Node watcher — Viteに依存しないが、HMRやmodule graphとの接続が弱い。
  2. Git hooks — コミット単位の履歴には強いが、開発中のHMRや画面変化を拾えない。
  3. Vite Plugin — dev serverイベントとUIを同じローカル環境でつなげられる。
- **Selected Approach**: Vite Pluginを記録入口にし、`handleHotUpdate`、dev server middleware、WebSocketを使う。
- **Rationale**: Viteカンファレンス向けに、Viteの開発体験そのものをアプリ価値として説明できる。
- **Trade-offs**: Vite以外のプロジェクトには初期版では対応しない。
- **Follow-up**: 実装時にVite 8の型定義とhook signaturesを確認する。

### Decision: 実行時データを`.spec-lens/`に分離する
- **Context**: スクリーンショットやイベントログは増え続けるため、仕様ファイルと同じ場所に置くと管理しにくい。
- **Alternatives Considered**:
  1. `.kiro/specs/spec-lens-timeline/`配下に保存 — Project Memoryが肥大化する。
  2. `src/data/`に保存 — アプリ実装と生成データが混ざる。
  3. `.spec-lens/`に保存 — 生成データとして分離し、Git管理から外しやすい。
- **Selected Approach**: 実行時データは`.spec-lens/`、発表用固定データは`demo-data/spec-lens/`に保存する。
- **Rationale**: 仕様、実行ログ、発表用サンプルのライフサイクルを分けられる。
- **Trade-offs**: デモデータ作成時にライブ記録から明示的にコピーする操作が必要。
- **Follow-up**: `.gitignore`とサンプルデータのコミット方針をtasksで確認する。

### Decision: スクリーンショットはPlaywright Capture Agentに任せる
- **Context**: 自動保存と手動保存の両方で画面状態を記録する必要がある。
- **Alternatives Considered**:
  1. html-to-image系ライブラリ — ブラウザ内で完結するが再現性に制約がある。
  2. ユーザー手動の画像アップロード — 安定するが自動保存要件を満たしにくい。
  3. Playwright — ローカルブラウザを制御してスクリーンショットを保存できる。
- **Selected Approach**: PlaywrightをローカルCapture Agentとして使い、対象URLのページスクリーンショットを保存する。
- **Rationale**: MVPで要件4の自動保存と手動保存を最も実装しやすい。
- **Trade-offs**: ブラウザ起動や対象URLの設定が必要。環境依存エラーをUIで扱う必要がある。
- **Follow-up**: 実装時にPlaywright install手順とCIでの扱いを確認する。

### Decision: 型付きイベントモデルを中心にする
- **Context**: cc-sdd、Vite、スクリーンショット、チェック、デモデータのイベント種別が増える。
- **Alternatives Considered**:
  1. 汎用JSONイベントだけにする — 早いがUIと検証で型安全性が落ちる。
  2. 種別ごとに別ストアにする — 整合性管理が重い。
  3. Discriminated unionの`TimelineEvent`に統合する。
- **Selected Approach**: TypeScriptのdiscriminated unionでイベント種別を表現し、NDJSONへ保存する。
- **Rationale**: `any`なしでUI、保存、チェック、デモ出力を横断できる。
- **Trade-offs**: イベントschemaの変更時にmigrationまたは互換読み込みが必要。
- **Follow-up**: schema versionを`EventEnvelope`に含め、破損イベントを隔離表示する。

### Decision: タイムライン閲覧は週単位ページを基本にする
- **Context**: 発表者が開発の流れを説明するとき、全イベントを1本の長いリストで見るより、1週間ごとのまとまりで振り返る方が認知負荷が低い。
- **Alternatives Considered**:
  1. 単一の無限スクロール — 実装は単純だが、長期開発では現在位置と説明単位が分かりにくい。
  2. 日単位ページ — 細かすぎて開発ストーリーが断片化しやすい。
  3. 週単位ページ — MVPの開発期間と発表準備の振り返り単位に合う。
- **Selected Approach**: タイムラインUIは現在週を初期表示し、前週/次週へ移動する`TimelineWeekPager`を提供する。
- **Rationale**: 1〜2週間MVP、最大1か月の発表準備というプロジェクト制約に合い、発表時も「今週何が進んだか」を説明しやすい。
- **Trade-offs**: 週をまたぐ作業は複数ページに分かれるため、検索と重要マーカーで横断できるようにする。
- **Follow-up**: 週境界はプロジェクトのローカルタイムゾーンで月曜始まりにする。

## Risks & Mitigations
- Playwrightの起動失敗 — Capture Agentの状態をUIに表示し、スクリーンショットなしでもイベント記録を継続する。
- イベントログ肥大化 — 初期版は検索と画像lazy loadを実装し、将来のページングやアーカイブに備える。
- Vite API変更 — Plugin APIに閉じたAdapter層を作り、Vite依存を`plugins/spec-lens/`に集約する。
- 再帰的な発表説明の分かりにくさ — design/tasksでは「アプリの利用価値」と「発表での見せ方」を分けて記述する。
- ローカルファイル書き込み失敗 — 保存エラーをイベント化し、ユーザーに保存先と権限の問題を示す。

## References
- [Vite Plugin API](https://vite.dev/guide/api-plugin.html) — Vite plugin hooks、dev server middleware、custom WebSocket events
- [Vite HMR API](https://vite.dev/guide/api-hmr.html) — client側HMRイベント購読
- [Playwright Screenshots](https://playwright.dev/docs/screenshots) — ページ、フルページ、要素スクリーンショット
- [React Blog](https://react.dev/blog) — React 19.2系と公式アップデート情報
