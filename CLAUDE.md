# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language
Always respond in Japanese.

## プロジェクト概要

Vite + React + Supabase（PostgreSQL）で構築した割り勘 Web アプリ。
Vercel でホスティングされており、GitHub への push で自動デプロイされる。

- **本番URL:** https://warican-one.vercel.app/
- **GitHub:** https://github.com/donrand/warican
- **Supabase プロジェクト:** https://supabase.com/dashboard/project/dvyvznamhovipyeccuis

## 開発コマンド

```bash
npm install       # 依存パッケージのインストール
npm run dev       # 開発サーバー起動（http://localhost:5174）
npm run build     # 本番ビルド（dist/ に出力）
npm run preview   # ビルド結果のプレビュー
```

開発サーバー起動後、VS Code の「ポート転送」タブでポート `5174` を追加するとブラウザからアクセスできる。

## 環境変数

`.env` ファイルをプロジェクトルートに作成（GitHub には含まれていないため手動で作成が必要）：

```
VITE_SUPABASE_URL=https://dvyvznamhovipyeccuis.supabase.co
VITE_SUPABASE_ANON_KEY=（Supabase ダッシュボード → Settings → API → anon キー）
```

Vercel の本番環境にも同じ環境変数を登録すること（Settings → Environment Variables）。

## アーキテクチャ

### 技術スタック
- **フロントエンド:** Vite + React（JavaScript）
- **データベース:** Supabase（PostgreSQL）
- **ホスティング:** Vercel（GitHub 連携で自動デプロイ）

### ファイル構成

```
src/
├── main.jsx              # React の起動
├── App.jsx               # 状態管理・DB連携の中心
├── App.css               # 全体スタイル
├── lib/
│   └── supabase.js       # Supabase クライアントの初期化
└── components/
    ├── ProjectList.jsx   # プロジェクト一覧・作成・削除
    ├── MemberForm.jsx    # メンバー登録・削除
    ├── PaymentForm.jsx   # 支払い入力（サンプルボタン付き）
    ├── PaymentList.jsx   # 支払い一覧・編集・削除
    └── Settlement.jsx    # 精算計算・残高サマリー・コピーボタン
```

### データ設計（Supabase）

```sql
projects  : id, name, completed, created_at
members   : id, project_id, name
payments  : id, project_id, payer, amount, description, participants(jsonb), created_at
```

`projects` を削除すると `members` と `payments` も CASCADE 削除される。

### 状態管理の方針

`App.jsx` がすべてのデータ取得・更新を担当し、各コンポーネントには props 経由でデータと操作関数を渡す。コンポーネントは表示とユーザー操作の通知のみを担う。

### 精算アルゴリズム（Settlement.jsx）

支払いを「通常」（支払者が参加者に含まれる）と「肩代わり」（含まれない）に分離して処理する。

1. 通常支払いのみで残高を計算し、グリーディ法で精算リストを作成
2. 肩代わり支払いごとに既存の取引を相殺・反転させて直接返却を表示

## デプロイ

`main` ブランチへの push で Vercel が自動デプロイする（1〜2分）。
デプロイ完了後は `Ctrl + Shift + R` でブラウザを強制リロードして確認する。
