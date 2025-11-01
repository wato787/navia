import { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getTeamFocus } from "./-functions/getTeamFocus";
import { PendingState } from "./-components/PendingState";
import { ErrorState } from "./-components/ErrorState";

type Focus = "routing" | "data" | "dx";

const focuses: Focus[] = ["routing", "data", "dx"];

const AboutRouteComponent = lazy(async () => {
  const module = await import("./route.lazy");
  return { default: module.AboutRoute };
});

const parseFocus = (value: unknown): Focus => {
  if (focuses.includes(value as Focus)) {
    return value as Focus;
  }
  return "routing";
};

export const Route = createFileRoute("/about")({
  validateSearch: (search: Record<string, unknown>) => ({
    focus: parseFocus(search.focus)
  }),
  loaderDeps: ({ search }) => ({
    focus: search.focus as Focus
  }),
  loader: ({ deps }) => {
    const knowledge = getTeamFocus();
    return {
      focus: deps.focus,
      knowledge
    };
  },
  pendingComponent: PendingState,
  errorComponent: ({ error }) => <ErrorState message={error.message ?? "Unknown error"} />,
  component: () => (
    <Suspense fallback={<PendingState />}>
      <AboutRouteComponent />
    </Suspense>
  )
});
