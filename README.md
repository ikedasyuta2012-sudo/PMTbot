# Discord Schedule Bot

指定した時刻にメッセージを自動送信するDiscord botです。

## 構成

```
discord-bot/
├── index.js           # Bot本体（起動・イベント処理）= システム
├── deploy-commands.js # スラッシュコマンドをDiscordに登録するスクリプト
├── commands/
│   ├── message.js     # /message コマンド（時刻+内容をセットで指定）= コマンド
│   └── unschedule.js  # /unschedule コマンド（予約停止）= コマンド
├── utils/
│   └── scheduler.js   # 時刻計算・繰り返し送信予約ロジック = システム
└── .env.example        # 環境変数の見本
```

## 使い方

**予約する（/message コマンド）**

```
/message time:21:00 content:おつかれさまでした！
```

実行したチャンネルに、指定時刻（HH:MM、24時間表記）から**毎日繰り返し**メッセージが自動送信されます。
実行すると予約ID（例: `a1b2c3d4`）が返ってきます。

送信先を別チャンネルにしたい場合は `channel` オプションを追加：

```
/message time:21:00 content:おつかれさまでした！ channel:#お知らせ
```

（Botにそのチャンネルへの送信権限が必要です）

**止める（/unschedule コマンド）**

```
/unschedule id:a1b2c3d4
```

※ 現状はメモリ上で予約を管理しているため、**Botを再起動すると全ての予約は消えます**。永続化したい場合は今後DBやファイル保存を追加できます。

## セットアップ手順

1. [Discord Developer Portal](https://discord.com/developers/applications) で Application を作成し、Bot を有効化
2. `TOKEN`（Bot Token）と `CLIENT_ID`（Application ID）を取得
3. Bot をサーバーに招待（OAuth2 URL Generator で `bot` と `applications.commands` スコープ、`Send Messages` 権限を選択）
4. リポジトリをclone後、依存関係をインストール

   ```bash
   npm install
   ```

5. `.env.example` を `.env` にコピーし、`DISCORD_TOKEN` と `CLIENT_ID` を設定
6. スラッシュコマンドを登録

   ```bash
   npm run deploy-commands
   ```

7. Botを起動

   ```bash
   npm start
   ```

## Railwayへのデプロイ

1. GitHubにこのリポジトリをpush
2. [Railway](https://railway.app/) で「New Project」→「Deploy from GitHub repo」でこのリポジトリを選択
3. Railwayの「Variables」タブで `DISCORD_TOKEN` と `CLIENT_ID`（必要なら `GUILD_ID` も）を設定
   - Railwayは `package.json` の `"start": "node index.js"` を自動検出して起動します
4. デプロイ後、ローカルまたはRailwayのシェルから一度だけ `npm run deploy-commands` を実行してスラッシュコマンドを登録
   （コマンド構成を変更した時だけ再実行すればOKです）
