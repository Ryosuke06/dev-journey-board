# Brief: spec-lens-integration-hardening

## Problem
個別機能が動いても、別のViteアプリへ導入し、Vite plugin、React UI、Local API、WebSocket、E2Eフローが一連で動かなければ発表で使えるアプリにならない。さらにイベント量が増えた時の性能と、ローカル専用制約も最後に確認する必要がある。

## Current State
基盤、Query、Recording、Capture/Check、DemoData、Local API、UIを分割specとして作る方針になっている。統合導線、WebSocketライブ更新、E2E、性能・安全性の仕上げは現行巨大specの7章と8章に残っている。

## Desired Outcome
`npm run dev` でReact pluginとSpecLens pluginが共存し、ローカルAPIとUIが同じdev server上で動く。新規イベント、capture結果、記録状態がUIへ反映され、cc-sdd更新からdemo exportまで一連のE2Eが通る。5,000件イベントでもテキスト情報を先に表示し、外部送信や任意パス書き込みを防ぐ。

## Approach
上流specの成果物を接続する統合specとして扱う。新規機能を広げるのではなく、設定、接続、smoke/E2E、パフォーマンス制約、ローカル専用制約の検証に集中する。

## Scope
- **In**:
  - Vite設定へのSpecLens plugin統合
  - React pluginとの共存確認
  - Local API base path確認
  - `spec-lens:recorded`、`spec-lens:status`、`spec-lens:capture-result` のライブ更新
  - WebSocket切断時のunknown表示
  - cc-sdd更新、Vite HMR、意思決定、手動capture、check、demo export、週単位閲覧のE2E
  - 5,000件イベントのテキスト先行表示
  - 画像一括読み込み防止
  - CORS非拡張、任意パス書き込み拒否、外部送信なし
- **Out**:
  - npmパッケージ公開
  - production server化
  - 外部WebSocket server
  - マルチユーザー同期
  - 10,000件超のindex化
  - ログ圧縮
  - 発表資料作成

## Boundary Candidates
- Vite config integration
- Dev server smoke tests
- WebSocket live update bridge
- Local development E2E
- Performance and local-only guard tests

## Out of Boundary
- クラウド、認証、複数repo対応
- package publish
- production hosting
- 長期運用向けログ圧縮
- 高度な再接続戦略

## Upstream / Downstream
- **Upstream**: `spec-lens-ui`、`spec-lens-recording`、`spec-lens-local-api`
- **Downstream**: Viteカンファレンス発表用デモ、将来の導入手順整備

## Existing Spec Touchpoints
- **Extends**: なし
- **Adjacent**: `spec-lens-timeline` の7.1から8.3をこのspecへ移す

## Constraints
- 既存の上流spec成果物を接続することに集中する。
- 外部送信なし、ローカルdev server内利用、任意パス拒否を崩さない。
- E2Eは主要導線に絞り、不安定な待機処理を増やさない。
- 性能検証はMVPの週単位ページングと画像lazy loadに限定する。
