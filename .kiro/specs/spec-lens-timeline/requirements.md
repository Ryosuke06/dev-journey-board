# Requirements Document

> **Status:** このrequirementsは2026-06-20時点で本命アプリ候補として再採用する。
> 作るものは、cc-sddでの開発過程を記録して分かりやすく見せるReact/Viteアプリである。
> 発表では、このアプリ自身をcc-sddで作る過程を題材として紹介する。

## Introduction
SpecLens Timelineは、発表者本人がcc-sddでReact/Viteアプリを作る過程を、あとから発表ストーリーとして見返せるローカル開発タイムラインである。
仕様決定、タスク進行、コード変更、Viteの開発サーバーイベント、検証結果、重要な意思決定、スクリーンショットを1つの時系列に統合し、Viteカンファレンスで「cc-sddで作る過程」と「完成アプリの技術的価値」を同じデモで説明できる状態を目指す。

## Boundary Context
- **In scope**: ローカル開発タイムライン、cc-sdd関連イベント、Vite開発サーバーイベント、重要イベント時と手動操作時のスクリーンショット、ルールベースの簡易チェック、発表用サンプルデータ
- **Out of scope**: クラウド同期、共有URL、ログイン、ユーザー管理、過去バージョンの完全な実行再現、AIによるコード品質採点、複数リポジトリ横断分析、チーム向け権限管理
- **Adjacent expectations**: cc-sddの仕様ファイルやタスクは既存ワークフローで作成・更新される前提とし、SpecLens Timelineはそれらを観測・表示する。React/Viteアプリの実装そのものや、仕様承認プロセスの代替はこの機能の責務にしない。

## Requirements

### Requirement 1: タイムライン表示
**Objective:** As a 発表者, I want 開発過程のイベントを時系列で一覧できる, so that 発表用のストーリーを再構成できる

#### Acceptance Criteria
1. When ユーザーがタイムライン画面を開く, the SpecLens Timeline shall 保存済みイベントを発生時刻順で表示する
2. When タイムラインにイベントが存在しない, the SpecLens Timeline shall 記録を開始するための案内を表示する
3. When ユーザーがイベント種別フィルタを選択する, the SpecLens Timeline shall 保存済みデータを削除せずに表示対象だけを絞り込む
4. When ユーザーがイベントを選択する, the SpecLens Timeline shall イベントの詳細、時刻、種別、関連パス、状態を表示する
5. The SpecLens Timeline shall cc-sddイベント、開発サーバーイベント、スクリーンショットイベント、チェックイベント、意思決定イベントを区別して表示する

### Requirement 2: cc-sdd進行の記録
**Objective:** As a 発表者, I want 仕様・設計・タスクの進行をタイムラインに残せる, so that cc-sddで作った過程を説明できる

#### Acceptance Criteria
1. When 仕様関連ファイルが作成または更新される, the SpecLens Timeline shall ファイル種別、パス、更新時刻を含むイベントを記録する
2. When タスクの開始または完了が記録される, the SpecLens Timeline shall タスク識別子、状態、関連仕様を含むイベントを表示できる
3. When 検証結果が記録される, the SpecLens Timeline shall 成功、失敗、未実施の状態と証跡概要を表示する
4. When ユーザーが重要な意思決定を記録する, the SpecLens Timeline shall 決定内容、理由、関連する仕様またはタスクをタイムラインに追加する
5. If イベントが特定の仕様またはタスクに紐付けられない, then the SpecLens Timeline shall 未紐付けイベントとして表示し、他のイベント表示を妨げない

### Requirement 3: Vite開発イベントの記録
**Objective:** As a 発表者, I want Viteの開発中イベントを仕様進行と並べて見られる, so that Viteの技術的価値を発表で説明できる

#### Acceptance Criteria
1. When 開発サーバーがHMR、フルリロード、またはエラーを報告する, the SpecLens Timeline shall イベント種別、発生時刻、影響を受けたファイルまたはモジュールを記録する
2. When 開発サーバーの更新が成功する, the SpecLens Timeline shall 利用可能な場合に更新所要時間を表示する
3. If 開発サーバーイベントの詳細情報が不足している, then the SpecLens Timeline shall 不明な項目を明示し、イベント自体は記録する
4. If 開発サーバーでエラーが発生する, then the SpecLens Timeline shall エラー概要と重大度を表示し、タイムライン表示を継続する
5. While ローカル記録が無効化されている, the SpecLens Timeline shall 新しい開発サーバーイベントを記録せず、記録停止中であることを表示する

### Requirement 4: スクリーンショット記録
**Objective:** As a 発表者, I want 重要な画面状態をイベントと一緒に残せる, so that 開発過程を視覚的に説明できる

#### Acceptance Criteria
1. When スクリーンショット対象の重要イベントが発生する, the SpecLens Timeline shall 現在の画面状態を保存し、対応するイベントに関連付ける
2. When ユーザーが「この瞬間を保存」操作を行う, the SpecLens Timeline shall 手動スクリーンショットイベントを作成し、画像を関連付ける
3. When ユーザーがスクリーンショット付きイベントを選択する, the SpecLens Timeline shall 画像プレビューを表示する
4. If スクリーンショット保存に失敗する, then the SpecLens Timeline shall 失敗理由を表示し、対応するイベントを失敗状態として残す
5. If イベントにスクリーンショットが存在しない, then the SpecLens Timeline shall 画像なしの状態を表示し、イベント詳細の閲覧を妨げない

### Requirement 5: ローカルデータ境界
**Objective:** As a プロジェクト管理者, I want 仕様ファイルと生成データを分離できる, so that 仕様文書を軽量に保ち、生成物の肥大化を避けられる

#### Acceptance Criteria
1. The SpecLens Timeline shall 仕様、設計、タスクなどの軽量なProject Memoryを`.kiro/specs/spec-lens-timeline/`に保持する
2. The SpecLens Timeline shall 実行時に増え続けるイベントログ、画像、スナップショット、レポートを`.spec-lens/`に保存する
3. The SpecLens Timeline shall スクリーンショットや生成ログを仕様Markdown本文へ埋め込まない
4. Where 発表用サンプルデータが作成される, the SpecLens Timeline shall 固定サンプルデータを`demo-data/spec-lens/`に分離する
5. If ローカル保存先へ書き込めない, then the SpecLens Timeline shall データを失わない範囲でエラーを表示し、ユーザーに保存先の問題を知らせる

### Requirement 6: ルールベースの簡易チェック
**Objective:** As a 発表者, I want 開発タイムラインに簡易チェック結果を含められる, so that 発表中に開発プロセスの健全性を説明できる

#### Acceptance Criteria
1. When ユーザーが簡易チェックを実行する, the SpecLens Timeline shall 仕様ファイルの有無、未完了タスク、検証未実施などの結果を表示する
2. When チェック結果が生成される, the SpecLens Timeline shall 各結果に成功、警告、失敗、スキップのいずれかの状態を付与する
3. When ユーザーがチェック結果を選択する, the SpecLens Timeline shall 判定理由と関連するファイルまたはタスクを表示する
4. If チェック対象が存在しない, then the SpecLens Timeline shall 失敗ではなくスキップとして扱い、理由を表示する
5. The SpecLens Timeline shall ルールベースの簡易チェックをAIによるコード品質採点として表示しない

### Requirement 7: 発表用デモデータ
**Objective:** As a 発表者, I want 発表で使う固定データをライブ記録と分けて扱える, so that 当日のデモを安定して実施できる

#### Acceptance Criteria
1. When ユーザーが発表用データを開く, the SpecLens Timeline shall ライブ記録とは区別されたサンプルタイムラインを表示する
2. When サンプルタイムラインにスクリーンショット参照が含まれる, the SpecLens Timeline shall 対応する画像を表示する
3. If サンプルタイムラインの参照画像が見つからない, then the SpecLens Timeline shall 欠落状態を表示し、他のイベント閲覧を継続する
4. When ユーザーがライブ記録から発表用データを作成する, the SpecLens Timeline shall 選択されたイベントと関連画像をサンプルデータとして分離する
5. The SpecLens Timeline shall サンプルデータとライブ記録のどちらを表示しているかをユーザーに明示する

### Requirement 8: ローカル完結と除外機能
**Objective:** As a 発表者, I want 初期版をローカルだけで使える, so that ログインや外部サービスなしで発表準備を進められる

#### Acceptance Criteria
1. The SpecLens Timeline shall ログインなしで利用できる
2. The SpecLens Timeline shall 記録したイベントとスクリーンショットを外部サービスへ送信しない
3. If ユーザーがクラウド同期、共有URL、またはチーム権限管理を期待する操作を探す, then the SpecLens Timeline shall 初期版では非対応であることを説明する
4. If ユーザーが過去バージョンの完全な実行再現を期待する, then the SpecLens Timeline shall スクリーンショットによる履歴表示が対象であることを説明する
5. The SpecLens Timeline shall 複数リポジトリの横断分析を初期版の機能として提供しない

### Requirement 9: タイムライン閲覧の安定性
**Objective:** As a 発表者, I want 記録量が増えても発表中に要点を確認できる, so that デモ中に迷わず説明を続けられる

#### Acceptance Criteria
1. While スクリーンショット画像を読み込んでいる, the SpecLens Timeline shall テキストベースのイベント情報を先に閲覧可能にする
2. If 一部のイベントデータが破損している, then the SpecLens Timeline shall 読み取れないイベントを示し、読み取れるイベントの表示を継続する
3. When ユーザーが検索語を入力する, the SpecLens Timeline shall イベントタイトル、種別、関連パス、説明から一致するイベントを表示する
4. When ユーザーが発表で重要なイベントを見つけた, the SpecLens Timeline shall そのイベントを目印として扱える表示を提供する
5. The SpecLens Timeline shall 記録中、停止中、エラー中の現在状態をユーザーに表示する
