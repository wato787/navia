# TanStack Router & Query 設定ガイド

AI Shift記事を参考に、TanStack Router & Queryを使用したSPAアプリケーションの構築方法を説明します。`apps/frontend` ディレクトリに実装されているコードを参考にしてください。

## セットアップ

```bash
bun add --cwd apps/frontend \
  @tanstack/react-router @tanstack/router-devtools \
  @tanstack/react-query @tanstack/router-plugin
```

- `vite.config.ts` に `TanStackRouterVite({ target: "react", autoCodeSplitting: true })` を追加して、ルート生成を有効化する
- **注意**: `@tanstack/router-vite-plugin` は非推奨です。代わりに `@tanstack/router-plugin` を使用してください
- QueryClient を `router.ts` で設定し、Router と Context を通じて React Query Provider として使用する

## ディレクトリ構成

```
apps/frontend/src/
  routes/
    __root.tsx
    home/
      -components/
      -functions/
      -api/
      -types/
      route.tsx
      route.lazy.tsx
    about/
      ...同様
  router.ts
  routeTree.gen.ts
```

各ルートディレクトリは feature-based の layer アーキテクチャで、`-components/-api/-types/-functions` のプレフィックスでディレクトリを分離して整理する。

## 実装方法

- `__root.tsx` で `createRootRouteWithContext` を使用して Devtools を有効化
- 各ルートの `route.tsx` で `createFileRoute` を使用してルートを定義する
  - `validateSearch` で search params を検証する
  - `loaderDeps` と `loader` で QueryClient を使って preload する
  - `pendingComponent` / `errorComponent` でローディング・エラー状態を表示する
  - `React.lazy` を使って `route.lazy.tsx` で UI コンポーネントを実装する

```20:40:apps/frontend/src/routes/home/route.tsx
export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    audience: parseAudience(search.audience)
  }),
  loaderDeps: ({ search }) => ({
    audience: search.audience as Audience
  }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(homeQueryOptions(deps.audience));
    return { audience: deps.audience };
  },
  pendingComponent: PendingState,
  errorComponent: ({ error }) => <ErrorState message={error.message ?? "Unknown error"} />,
  component: () => (
    <Suspense fallback={<PendingState />}>
      <HomeRouteComponent />
    </Suspense>
  )
});
```

```1:56:apps/frontend/src/routes/home/route.lazy.tsx
export function HomeRoute() {
  const navigate = useNavigate({ from: "/" });
  const search = Route.useSearch();
  const loaderData = Route.useLoaderData();

  const activeAudience = loaderData.audience;
  const { data } = useSuspenseQuery(homeQueryOptions(activeAudience));

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      ...
    </div>
  );
}
```

## Search Params の管理

- Home ルートでは `audience`、About ルートでは `focus` などの search params を使用して、URL から状態を管理する
- `loaderDeps` を使って依存関係を定義し、SWR のような動作を実現する

## React Query の統合

- `router.ts` で QueryClient を Router context に設定し、`ensureQueryData` で preload と `useSuspenseQuery` を使用してデータ取得を行う
- これにより、Suspense + ErrorBoundary を使用した非同期処理が可能になる

```5:22:apps/frontend/src/router.ts
export const queryClient = new QueryClient();

export const router = createRouter({
  routeTree,
  context: {
    queryClient
  },
  defaultPreload: "intent"
});
```

## Devtools

- `__root.tsx` で `TanStackRouterDevtools` を追加し、`import.meta.env.PROD` で本番環境では無効化する
- React Query Devtools も同様に `App.tsx` で追加する

## TODO リスト

- pages ディレクトリから routes ディレクトリへの移行作業を完了する
- loader / validateSearch / Suspense の実装を確認する
- TanStack Query と Search Params を連携させた実装例を追加する

## 参考資料

- [TanStack Router for React](https://tanstack.com/router/latest/docs/framework/react/overview)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TanStack Router & Queryを使ったSPA開発のベストプラクティス](https://zenn.dev/aishift/articles/ad1744836509dd)
