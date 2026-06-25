# 技術方針

## 基本スタック

- React 19.2系、Vite 8系、TypeScript 5系を使う。
- UIコンポーネントとスタイルはMUIを優先する。
- 生CSSは原則として使わない。使う場合は、MUI Themeや`sx`では表現しにくいグローバルなブラウザ補正に限定する。
- テストはVitest、React Testing Library、Playwrightを使う。
- 初期版はローカル完結とし、ログイン、クラウド同期、外部API送信は実装しない。

## npm scripts

- `npm run dev`: Vite dev serverを起動する。
- `npm run typecheck`: TypeScriptの型チェックを実行する。
- `npm run test`: Vitestの単体・コンポーネントテストを実行する。
- `npm run build`: 型チェック後にproduction buildを実行する。
- `npm run e2e`: PlaywrightでE2Eテストを実行する。

## 依存関係

- 実行時にブラウザへ含まれるものは`dependencies`へ置く。
- ビルド、型、テスト、開発サーバーだけに必要なものは`devDependencies`へ置く。
- TypeScript 6系など、承認済みdesignと異なるメジャーバージョンへ上げる場合は、独立したタスクとして扱う。

## データ境界

- `.kiro/specs/` は仕様、設計、タスクなどのProject Memoryを置く場所である。
- `.spec-lens/` は実行時ログ、画像、スナップショット、レポートなど増え続ける生成データを置く場所である。
- `demo-data/spec-lens/` は発表用に固定したデモデータを置く場所である。
- スクリーンショットや生成ログを仕様Markdown本文へ埋め込まない。
