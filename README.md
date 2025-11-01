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

## ディレクトリ構成

```
apps/
  frontend/   # React + Vite アプリケーション
  backend/    # Hono + Bun API サーバー
.mise.toml     # mise のツール定義とタスク
bunfig.toml    # Bun ワークスペース設定
package.json   # リポジトリ共通スクリプト
```
