# Brief: spec-lens-local-api

## Problem
Reactブラウザ画面はローカルファイルを直接読めないため、Vite dev server内のローカルAPIが必要である。現行specではtimeline取得、意思決定登録、capture、check、demo export、validationが1つの巨大なAPIタスクにまとまっている。

## Current State
EventStore、Query、Recording、Capture/Check、DemoDataが上流specとして分割される予定である。API層は未着手である。

## Desired Outcome
React UIが、週単位タイムライン取得、意思決定登録、手動capture、check実行、demo export、validation errorをHTTP API経由で扱える。記録状態はWebSocketまたはVite dev serverのイベントで通知できる。

## Approach
`plugins/spec-lens/server/presentation/api/` へLocalApiRouterを置き、HTTP request/response境界に集中させる。usecaseを呼び出し、DTOへ変換して返す。UIはserver実装を直接importしない。

## Scope
- **In**:
  - `GET /__spec-lens/api/events`
  - `POST /__spec-lens/api/events/decision`
  - `POST /__spec-lens/api/capture`
  - `POST /__spec-lens/api/checks/run`
  - `POST /__spec-lens/api/demo/export`
  - request validation
  - 任意パス拒否
  - local-only policy
  - recorder status通知
- **Out**:
  - React UI
  - EventStore本体
  - QueryService本体
  - Capture/Check/Demoの業務ロジック本体
  - 認証、CORS拡張、外部公開API

## Boundary Candidates
- LocalApiRouter
- Timeline API DTO
- Capture/Check/Demo API DTO
- RecorderStatus websocket presenter

## Out of Boundary
- ログイン
- 共有URL
- 外部公開API
- 画像アップロード
- 任意ディレクトリ書き込み許可

## Upstream / Downstream
- **Upstream**: `spec-lens-query`、`spec-lens-recording`、`spec-lens-capture-check`、`spec-lens-demo-data`
- **Downstream**: `spec-lens-ui`

## Existing Spec Touchpoints
- **Extends**: なし
- **Adjacent**: `spec-lens-timeline` の5.1から5.4をこのspecへ移す

## Constraints
- APIはVite dev server内のローカル利用に限定する。
- CORSを広げない。
- ファイルパスはproject root配下へ正規化する。
- エラー時も取得済みタイムライン情報を壊さない。
