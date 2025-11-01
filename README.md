# Bun + Mise モノレポ

このリポジトリは、`mise` をタスクランナーとして利用し、Bun のワークスペース機能で React (Vite) フロントエンドと Hono バックエンドをまとめたモノレポ構成です。

## 前提条件

- [mise](https://mise.jdx.dev/getting-started.html) をインストールしていること
- `mise install` 経由で Bun が導入できること（例: `mise use -g bun@latest`）

## 初期セットアップ

```bash
# .mise.toml に記載されたツールチェーンを導入
mise install

# Bun ワークスペースの依存関係をインストール
mise run install
```

## 開発サーバーの起動

フロントエンドとバックエンドを同時に起動します。

```bash
mise run dev
```

終了する際は、実行したターミナルで `Ctrl+C` を押してください。

## ビルド

フロントエンドとバックエンドを順番にビルドします。

```bash
mise run build
```
## コード品質チェック（Biome）

フロントエンド／バックエンド双方の TypeScript コードを [Biome](https://biomejs.dev/) で統一的に整えています。ルート直下の `biome.json` で共通設定を定義し、各アプリ向けのグローバルをオーバーライドするモノレポ構成です。

```bash
# 静的解析（自動修正なし）
npm run lint

# フォーマット・Lint・安全な修正の一括チェック（CI向け）
npm run check

# フォーマットを適用
npm run format

# フォーマットの差分のみ確認
npm run format:check

# Lintの安全な修正を適用
npm run lint:fix
```

`npm run` の代わりに `npx biome ...` を直接利用したり、`mise` のタスクへ組み込む運用も可能です。CI では `npm run check` を使うことで、Lint とフォーマットの両方を同時に検証できます。

## ディレクトリ構成

```
apps/
  frontend/   # React + Vite アプリケーション
  backend/    # Hono + Bun API サーバー
.mise.toml     # mise のツール定義とタスク
bunfig.toml    # Bun ワークスペース設定
package.json   # リポジトリ共通スクリプト
```
