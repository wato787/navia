import { useCallback, useEffect, useMemo, useRef, type ChangeEvent } from "react";
import MapComponent, {
  GeolocateControl,
  NavigationControl,
  ScaleControl,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ErrorComponentProps } from "@tanstack/react-router";
import "mapbox-gl/dist/mapbox-gl.css";

import { Route } from "./index";
import {
  MAPBOX_STYLE_OPTIONS,
  MAX_MAP_ZOOM,
  MIN_MAP_ZOOM,
  mapViewQueryOptions,
  normalizeZoom,
  type MapStyle,
} from "./index.shared";
import styles from "./index.module.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";
const MAP_CENTER = { longitude: 139.767125, latitude: 35.681236 };

export const PendingState = () => (
  <div className={styles.map}>
    <div className={styles.fallback}>Loading Map...</div>
  </div>
);

export const ErrorState = ({ error }: ErrorComponentProps) => (
  <div className={styles.map}>
    <div className={styles.fallback} role="alert">
      Failed to load map: {error.message ?? "Unknown error"}
    </div>
  </div>
);

export function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const mapRef = useRef<MapRef | null>(null);

  const { data } = useSuspenseQuery(mapViewQueryOptions(loaderData));

  useEffect(() => {
    mapRef.current?.setZoom(data.zoom);
  }, [data.zoom]);

  const handleStyleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextStyle = event.target.value as MapStyle;
      navigate({
        search: (prev) => ({ ...prev, style: nextStyle }),
      });
    },
    [navigate],
  );

  const handleZoomChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextZoom = normalizeZoom(event.target.value);
      navigate({
        search: (prev) => ({ ...prev, zoom: nextZoom }),
        replace: true,
      });
    },
    [navigate],
  );

  const handleMoveEnd = useCallback(
    (event: ViewStateChangeEvent) => {
      const nextZoom = normalizeZoom(event.viewState.zoom);
      if (nextZoom === data.zoom) {
        return;
      }
      navigate({
        search: (prev) => ({ ...prev, zoom: nextZoom }),
        replace: true,
      });
    },
    [data.zoom, navigate],
  );

  const mapStyle = useMemo(
    () => `mapbox://styles/mapbox/${data.style}`,
    [data.style],
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className={styles.map}>
        <div className={styles.fallback}>
          Mapbox access token is required. Set VITE_MAPBOX_ACCESS_TOKEN.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.map}>
      <aside className={styles.toolbar}>
        <header className={styles.toolbarHeader}>
          <span className={styles.toolbarLabel}>Map settings</span>
          <span className={styles.toolbarBadge}>TanStack Router</span>
        </header>
        <label className={styles.controlGroup}>
          <span className={styles.controlLabel}>Style</span>
          <select
            value={data.style}
            onChange={handleStyleChange}
            className={styles.select}
          >
            {MAPBOX_STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.controlGroup}>
          <span className={styles.controlLabel}>Zoom</span>
          <input
            type="range"
            min={MIN_MAP_ZOOM}
            max={MAX_MAP_ZOOM}
            step={1}
            value={data.zoom}
            onChange={handleZoomChange}
            className={styles.range}
          />
          <span className={styles.rangeValue}>{data.zoom.toFixed(0)}</span>
        </label>
      </aside>
      <MapComponent
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          ...MAP_CENTER,
          zoom: data.zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        pitchWithRotate={true}
        attributionControl={true}
        onMoveEnd={handleMoveEnd}
      >
        <NavigationControl position="top-right" visualizePitch={true} />
        <GeolocateControl
          position="top-right"
          trackUserLocation={true}
          showAccuracyCircle={false}
          positionOptions={{ enableHighAccuracy: true }}
        />
        <ScaleControl unit="metric" />
      </MapComponent>
    </div>
  );
}
