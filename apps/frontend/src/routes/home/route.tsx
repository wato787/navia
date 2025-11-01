import { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Audience } from "./-types";
import { PendingState } from "./-components/PendingState";
import { ErrorState } from "./-components/ErrorState";
import { homeQueryOptions } from "./-api/homeQueryOptions";

const HomeRouteComponent = lazy(async () => {
  const module = await import("./route.lazy");
  return { default: module.HomeRoute };
});

const parseAudience = (value: unknown): Audience => {
  if (value === "designer" || value === "stakeholder") {
    return value;
  }
  return "developer";
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    audience: parseAudience(search.audience)
  }),
  loaderDeps: ({ search }) => ({
    audience: search.audience as Audience
  }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(homeQueryOptions(deps.audience));
    return {
      audience: deps.audience
    };
  },
  pendingComponent: PendingState,
  errorComponent: ({ error }) => <ErrorState message={error.message ?? "Unknown error"} />,
  component: () => (
    <Suspense fallback={<PendingState />}>
      <HomeRouteComponent />
    </Suspense>
  )
});
