# TanStack Router ベストプラクティス

TanStack Router v1 系の推奨パターンと、`apps/frontend` における実装方針をまとめます。React Query との統合や、ファイルベースルーティングを前提としています。

## コア原則

- **ファイルベースルーティング**: `@tanstack/router-plugin` を使い、`src/routes` 配下で `__root.tsx` / `index.tsx` などのファイル構成を保つ。
- **型付きの共有コンテキスト**: `createRootRouteWithContext` と `createRouter` に同じ `RouterContext` 型を渡し、QueryClient やセッション情報を一元管理する。
- **URL を単一の状態源に**: `validateSearch`・`loaderDeps` で Search Params をスキーマ化し、`Route.useSearch()` 経由でコンポーネントに注入する。
- **データプリフェッチ & Suspense**: ルート `loader` で `queryClient.ensureQueryData` を呼び出し、`Suspense` + `pendingComponent` / `errorComponent` を組み合わせる。
- **開発者体験の最適化**: `defaultPreload: "intent"` による先読み、`TanStackRouterDevtools` の開発時限定表示、`routeTree.gen.ts` の自動生成を CI に組み込む。
- **副作用の境界管理**: `beforeLoad` / `meta` / `shouldReload` などルート専用 API を使い、副作用ロジックをコンポーネント外に逃す。

## セットアップ

```bash
bun add --cwd apps/frontend \
  @tanstack/react-router @tanstack/router-devtools \
  @tanstack/react-query @tanstack/router-plugin
```

- `apps/frontend/vite.config.ts` に `tanstackRouter({ routesDirectory: "./src/routes" })` を登録する。
- plugin が生成した `routeTree.gen.ts` を `router.ts` で読み込み、`createRouter` の `routeTree` に渡す。
- QueryClient を `RouterContext` に含め、`App.tsx` で `QueryClientProvider` と `RouterProvider` をネストする。
- CI では `bun vite --cwd apps/frontend tanstack-router generate` を実行し、`routeTree.gen.ts` の破壊的変更を検出する。

## ディレクトリ構成 (推奨例)

```
apps/frontend/src/
  router.ts
  routeTree.gen.ts
  routes/
    __root.tsx
    index.tsx
    index.lazy.tsx
    index.module.css
    about/
      route.tsx
      route.lazy.tsx
      ...
```

- ルート直下では `index.tsx` / `index.lazy.tsx` をペアにし、UI を遅延読み込みする。
- 機能単位で `components/`・`api/`・`models/` などに分割し、ルートファイルには TanStack Router API だけを記述する。

## ルート実装パターン

```15:42:apps/frontend/src/routes/index.tsx
export const Route = createFileRoute("/")({
  validateSearch: resolveSearchParams,
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(mapViewQueryOptions(deps));
    return deps;
  },
}).lazy(() =>
  import("./index.lazy").then((module) => ({
    component: module.RouteComponent,
    pendingComponent: module.PendingState,
    errorComponent: module.ErrorState,
  })),
);
```

- `.lazy()` から `component`・`pendingComponent`・`errorComponent` を返し、ルートファイルを「設定」に集中させる。
- `loaderDeps` を Search Params に合わせて宣言し、`ensureQueryData` の Query Key と同期させる。
- ルート配下のコンポーネントでは `Route.useLoaderData()` / `useSuspenseQuery(mapViewQueryOptions(...))` を組み合わせて URL 状態とキャッシュを一元化する。

## Search Params 設計

- `validateSearch` 内で `zod` やカスタム関数を使い、URL から受け取るすべての値を正規化する。
- `Route.updateSearch` や `useNavigate({ search, from })` を活用し、副作用なく URL 状態を書き換える。
- 同じ Search Params を複数ルートで再利用する場合は、型・ユーティリティを `routes/_shared/search.ts` のような場所にまとめる。

## React Query との統合

- ルート `loader` では Query Key を返す関数 (`mapboxQueryOptions` など) を呼び出し、`ensureQueryData` で Suspense 用にデータを温める。
- コンポーネント側は `useSuspenseQuery` を使い、`loader` と同じ Query Key を再利用することでキャッシュヒット率を最大化する。
- `defaultPreload: "intent"` を有効にすると、ユーザーがリンクへフォーカス / ホバーした時点で `loader` が走り、体感速度が向上する。

## Devtools と観測性

- `__root.tsx` で `TanStackRouterDevtools` を読み込み、`!import.meta.env.PROD` の条件で出し分ける。
- React Query Devtools は `App.tsx` で同様に条件付き表示する。
- ルーティング関連のログは `router.subscribe` でフックできるため、計測が必要になった場合は専用モジュールに切り出す。

## 運用チェックリスト

- [ ] 新規ルートを追加したら `bun vite tanstack-router generate` を必ず実行する
- [ ] Search Params に破壊的変更を入れる際はマイグレーションパスを設計する
- [ ] `loader` / `action` は副作用を含めず、外部 API 呼び出しは専用クライアントに委譲する
- [ ] Devtools の表示条件や defaultPreload 設定を本番リリース前に再確認する

## 参考資料

- [TanStack Router for React](https://tanstack.com/router/latest/docs/framework/react/overview)
- [TanStack Router Route APIs](https://tanstack.com/router/latest/docs/framework/react/route-api)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TanStack Router & Queryを使ったSPA開発のベストプラクティス](https://zenn.dev/aishift/articles/ad1744836509dd)
