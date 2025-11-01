import type { QueryKey } from "@tanstack/react-query";

export const MAPBOX_STYLE_OPTIONS = [
  { label: "Streets", value: "streets-v12" },
  { label: "Outdoors", value: "outdoors-v12" },
  { label: "Satellite", value: "satellite-streets-v12" },
] as const;

export type MapStyle = (typeof MAPBOX_STYLE_OPTIONS)[number]["value"];

export const DEFAULT_MAP_STYLE: MapStyle = "streets-v12";
export const DEFAULT_MAP_ZOOM = 12;
export const MIN_MAP_ZOOM = 3;
export const MAX_MAP_ZOOM = 18;

export type MapSearchParams = {
  style: MapStyle;
  zoom: number;
};

export const isMapStyle = (value: unknown): value is MapStyle =>
  typeof value === "string" &&
  MAPBOX_STYLE_OPTIONS.some((option) => option.value === value);

export const normalizeZoom = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_MAP_ZOOM;
  }
  return Math.min(Math.max(parsed, MIN_MAP_ZOOM), MAX_MAP_ZOOM);
};

export const mapViewQueryOptions = (params: MapSearchParams) => ({
  queryKey: ["mapView", params.style, params.zoom] satisfies QueryKey,
  queryFn: async () => params,
  staleTime: 5 * 60 * 1_000,
});
