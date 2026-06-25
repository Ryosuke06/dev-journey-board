# 構成方針

## ディレクトリ責務

- `src/app/`: アプリ全体のshell、theme、ルーティングなどを置く。
- `src/features/`: ユーザー機能ごとのUI、client、selectorを置く。
- `src/shared/`: UIとserverのどちらにも依存しない小さな共通処理を置く。
- `shared/spec-lens/`: UI、plugin、serverで共有するドメイン型や保存パス契約を置く。
- `plugins/spec-lens/`: Vite plugin、ローカルAPI、ファイル監視、保存層、Playwright連携などNode/Vite側の処理を置く。
- `tests/e2e/`: PlaywrightのE2Eテストを置く。

## バックエンドDDDレイヤー

`plugins/spec-lens/server/` 配下のローカルバックエンドは、DDDを意識して責務を分ける。
現時点の実装はReact/Vite起動基盤までであり、このレイヤー構成はまだコードには存在しない。バックエンド機能を実装するタスクから、この構成を導入する。

```text
plugins/spec-lens/server/
├── domain/
│   ├── models/
│   ├── services/
│   └── repositories/
├── usecases/
├── infrastructure/
│   ├── file-system/
│   ├── playwright/
│   └── vite/
└── presentation/
    ├── api/
    └── websocket/
```

- `domain/`: 業務ルール、エンティティ、値オブジェクト、ドメインサービス、repository interfaceを置く。
- `usecases/`: アプリケーションの操作単位を置く。例: イベント記録、週単位タイムライン取得、スクリーンショット保存、デモデータ作成。
- `infrastructure/`: ファイルシステム、Playwright、Vite dev server、NDJSONなど外部技術への具体実装を置く。
- `presentation/`: HTTP API、WebSocket、Vite middlewareなど入出力境界を置く。

依存方向は `presentation -> usecases -> domain`、`infrastructure -> domain` を基本にする。`domain` は `usecases`、`infrastructure`、`presentation` に依存しない。

## 境界ルール

- UI層は`plugins/spec-lens/server/`を直接importしない。
- UI層はローカルAPI clientと型付きDTOを通じてデータを扱う。
- Vite、Playwright、Node.jsのファイルシステム依存は`plugins/spec-lens/`側へ閉じ込める。
- domain層はVite、Playwright、Node.js filesystem、HTTP request/response型に依存しない。
- usecase層はrepository interfaceに依存し、具体的な保存実装やPlaywright実装を直接newしない。
- infrastructure層はdomainで定義したrepository interfaceを実装する。
- presentation層は入力のvalidation、DTO変換、usecase呼び出し、HTTP/WebSocket response生成に集中する。
- ドメイン型はUI都合に寄せすぎず、記録・保存・表示で共有できる形を優先する。
- 保存先パスは文字列を各所に直書きせず、共通モジュールで定義する。

## ファイル分割

- 1ファイルが大きくなり始めたら、責務単位で分割する。
- 目安として、Reactコンポーネントは画面、領域、部品の責務が混ざったら分ける。
- 汎用化は急がない。2回目の重複までは許容し、3回目で抽象化を検討する。
- `index.ts`による過剰な再exportは避ける。依存関係が見えにくくなる場合は直接importを優先する。
