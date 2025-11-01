import { createFileRoute } from "@tanstack/react-router";
import {
  DEFAULT_MAP_STYLE,
  type MapSearchParams,
  isMapStyle,
  mapViewQueryOptions,
  normalizeZoom,
} from "./index.shared";

const resolveSearchParams = (search: Record<string, unknown>): MapSearchParams => ({
  style: isMapStyle(search.style) ? search.style : DEFAULT_MAP_STYLE,
  zoom: normalizeZoom(search.zoom),
});

export const Route = createFileRoute("/")({
  validateSearch: resolveSearchParams,
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(mapViewQueryOptions(deps));
    return deps;
  },
}).lazy(async () => {
  const module = await import("./index.lazy");
  return {
    component: module.RouteComponent,
    pendingComponent: module.PendingState,
    errorComponent: module.ErrorState,
  };
});
