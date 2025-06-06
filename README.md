# Discord Readme Bot

<img src="./images/banner.webp" width="100%">

<div align="center">

![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**Discordサーバーでメッセージの既読管理とリマインドするBot**

[🚀 セットアップ](#-セットアップ) • [📖 使い方](#-使い方) • [⚙️ コマンド](#️-コマンド)

</div>

---

## ✨ 特徴

<div align="center">

<table>
<tr>
<td align="center" width="50%">
<img src="./images/mail-check.svg">
<h3>既読機能</h3>
<p>メンションされたメッセージに自動で👀リアクションを追加し、簡単に既読確認ができます</p>
</td>
<td align="center" width="50%">
<img src="./images/list.svg">
<h3>既読状況確認</h3>
<p>誰が既読して誰が未読なのかを一目で確認できる管理機能</p>
</td>
</tr>
<tr>
<td align="center" width="50%">
<img src="./images/notice.svg">
<h3>リマインダー</h3>
<p>未読者に一括でDMリマインダーを送信し、重要な情報の見落としを防止</p>
</td>
<td align="center" width="50%">
<img src="./images/user-heart.svg">
<h3>ユーザーフレンドリー</h3>
<p>シンプルな機能と分かりやすい通知機能でユーザーに優しい設計</p>
</td>
</tr>
</table>

</div>

## 🎯 使用場面

- **重要なお知らせ**: 全メンバーに確実に読んでもらいたい情報
- **イベント告知**: ゲームイベントや配信の告知
- **業務連絡**: チーム内での重要な業務連絡
- **学習グループ**: 課題や資料の共有確認

## 🚀 セットアップ

### 前提条件

![Node.js](https://img.shields.io/badge/Node.js-v16%2B-brightgreen?style=flat-square&logo=node.js)
![Discord Bot](https://img.shields.io/badge/Discord-Bot%20Account-blue?style=flat-square&logo=discord)

### 1. プロジェクトのクローン

```bash
git clone https://github.com/your-username/discord-readme-bot.git
cd discord-readme-bot
```

### 2. 依存関係のインストール

```bash
npm install
# または
bun install
```

### 3. 環境変数の設定

`.env` ファイルを作成し、以下の内容を記述：

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id_here
READ_REACTION_EMOJI=👀
COMMAND_NAME=readme
```

### 4. Botの起動

```bash
# 開発モード（ファイル変更を監視）
npm run watch

# 本番モード
npm start
```

## 📖 使い方

### 1. メッセージの投稿
ReadmeBotをメンションして、対象ユーザーもメンションしたメッセージを送信します。

```
@ReadmeBot @開発チーム
明日のリリースについて重要な変更があります。
必ず15時までに確認をお願いします。
```

### 2. 既読確認
メッセージを読んだら👀リアクションをクリックします。

### 3. 管理・リマインダー
管理者がスラッシュコマンドで既読状況を確認し、必要に応じてリマインダーを送信します。

## ⚙️ コマンド

| コマンド | 説明 | 権限 |
|:---------|:------|:------|
| `/readme help` | コマンド一覧を表示 | 管理者 |
| `/readme usage` | 使い方ガイドを表示 | 管理者 |
| `/readme check <message_id>` | 指定メッセージの既読状況を確認 | 管理者 |
| `/readme remind <message_id>` | 未読者にDMリマインダーを送信 | 管理者 |

### 🎯 対象ユーザーの指定方法

| 指定方法 | 例 | 説明 |
|:---------|:---|:------|
| **個別指定** | `@ユーザー1 @ユーザー2` | 特定のユーザーのみ |
| **ロール指定** | `@管理者` | ロールメンバー全員 |
| **全員指定** | `@everyone` | サーバーメンバー全員 |
| **オンライン指定** | `@here` | オンラインメンバーのみ |

## 🛠️ 技術スタック

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=flat&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Biome](https://img.shields.io/badge/Biome-60A5FA?style=flat&logo=biome&logoColor=white)

- **[Discord.js v14](https://discord.js.org/)** - Discord Bot開発ライブラリ
- **[TypeScript](https://www.typescriptlang.org/)** - 型安全なJavaScript
- **[Biome](https://biomejs.dev/)** - 高速なフォーマッター・リンター
- **[tsx](https://github.com/esbuild-kit/tsx)** - TypeScript実行環境

## 🔒 権限設定

Botには以下の権限が必要です。

| 権限 | 用途 |
|:------|:------|
| `Send Messages` | メッセージ送信 |
| `Add Reactions` | リアクション追加 |
| `Manage Messages` | リアクション削除 |
| `Read Message History` | 過去メッセージ取得 |
| `Use Slash Commands` | スラッシュコマンド使用 |

## 🎨 カスタマイズ

### 環境変数での設定

```env
# 既読確認用の絵文字を変更
READ_REACTION_EMOJI=✅

# コマンド名を変更
COMMAND_NAME=kidoku
```

### 色のカスタマイズ

`src/config.ts` でEmbed色を変更できます：

```typescript
export const INFO_COLOR: ColorResolvable = 0x3498db;    // 青
export const SUCCESS_COLOR: ColorResolvable = 0x2ecc71; // 緑
export const WARNING_COLOR: ColorResolvable = 0xf1c40f; // 黄
export const ERROR_COLOR: ColorResolvable = 0xe74c3c;   // 赤
```

## 🐛 トラブルシューティング

<details>
<summary>Bot が起動しない</summary>

- `.env` ファイルが正しく設定されているか確認
- Discord Token とClient IDが正しいか確認
- Botがサーバーに招待されているか確認

</details>

<details>
<summary>コマンドが実行できない</summary>

- 実行者が管理者権限を持っているか確認
- Botにスラッシュコマンド権限があるか確認

</details>

<details>
<summary>リアクションが追加されない</summary>

- Botがメンションされているか確認
- 対象ユーザーがメンションされているか確認
- Botにリアクション追加権限があるか確認

</details>

## 🤝 コントリビューション

コントリビューションを歓迎します！以下の手順でお願いします：

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### 開発環境

```bash
# コードフォーマット
npm run biome:format

# リント実行
npm run biome:lint

# コード品質チェック
npm run biome:check
```

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。