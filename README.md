# GREEN BEAT NAVI

森林公園駅から緑道へ、音楽・地域の食・楽器体験を案内するイベントPWAです。

現在はデモ・プレゼン用MVPです。コースは森林公園駅北口ロータリーを発着点とし、森林公園南口ゲートで折り返す森林公園緑道の往復約5.8kmです。表示している日程、途中のスポット配置、プログラムは企画検討用の仮データです。

- 主催：埼玉県森林公園緑道
- 指定管理者：一般社団法人埼玉県造園業協会

## 必要環境

- Docker Desktop
- Docker Compose

ホスト側にNode.jsをインストールする必要はありません。

## 開発サーバー

```bash
docker compose up
```

ブラウザで <http://localhost:3000> を開きます。

## 検証

```bash
docker run --rm -v "$PWD":/app -w /app node:lts-alpine npm ci
docker run --rm -v "$PWD":/app -w /app node:lts-alpine npm run lint
docker run --rm -v "$PWD":/app -w /app node:lts-alpine npm run typecheck
docker run --rm -v "$PWD":/app -w /app node:lts-alpine npm test
docker run --rm -v "$PWD":/app -w /app node:lts-alpine npm run build
```

## 実装フェーズ

1. 開発基盤、PWAマニフェスト、モバイル画面骨格（完了）
2. 会場マップ、タイムテーブル、スポット一覧、オフライン閲覧（デモ版）
3. 運営管理画面とブラウザ内リアルタイム更新（デモ版）
4. QRスタンプ、達成クーポン、お気に入り、通知許可UI（デモ版）

## ドキュメント

- [総合企画・運営仕様書](./docs/OPERATIONS_SPEC.md)(GBN-OPS-001)
- [操作マニュアル](./docs/USER_MANUAL.md)(GBN-MAN-001)
- [セキュリティ・個人情報管理・無人自動更新 設計書](./docs/SECURITY_AUTOMATION_SPEC.md)(GBN-SEC-001)
- [コンテンツ編集ガイド](./docs/CONTENT_GUIDE.md)(GBN-CNT-001)
- [デプロイ手順書(Cloud Run)](./docs/DEPLOYMENT_GUIDE.md)(GBN-DEP-001)
- [検証試験報告書](./docs/TEST_REPORT.md)(GBN-TST-001)

## Gitフック(GitKraken対応の自動チェック)

コミット時に lint と typecheck、プッシュ時にテストが自動実行されます(Docker 経由のためホストに Node.js は不要)。GitKraken からのコミット・プッシュでも同じフックが動作します。

クローン直後に一度だけ次を実行してください。

```bash
git config core.hooksPath .githooks
```

緊急時にスキップする場合は `GBN_SKIP_CHECKS=1` を設定するか、`--no-verify` を使用します。

## データ編集

開催概要・見どころ・タイムテーブル(演奏曲)・スポット位置・コースは `src/data/content.json` に集約しています。編集方法は[コンテンツ編集ガイド](./docs/CONTENT_GUIDE.md)を参照してください。編集ミスはコミット時の自動チェックと CI が検出します。

本番情報が確定するまで、未確認の日時や座標を確定情報として掲載しないでください。
