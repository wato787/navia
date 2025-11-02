import { useCallback } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import { ROUTE_LAYER_CONFIG, FIT_BOUNDS_PADDING } from "@/routes/const";
import { calculateBounds } from "@/lib/mapbox";

/**
 * 経路を地図上に表示するフック
 */
export function useRouteDisplay(mapRef: React.RefObject<MapRef | null>) {
  const displayRoute = useCallback(
    async (routeGeoJson: GeoJSON.FeatureCollection) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      // 既存の経路ソースがあれば削除
      if (map.getSource("route")) {
        if (map.getLayer("route")) {
          map.removeLayer("route");
        }
        map.removeSource("route");
      }

      // 新しい経路を追加
      map.addSource("route", {
        type: "geojson",
        data: routeGeoJson,
      });

      map.addLayer({
        ...ROUTE_LAYER_CONFIG,
        source: "route",
      });

      // 経路全体が見えるようにカメラを調整
      const coordinates = routeGeoJson.features[0].geometry as GeoJSON.LineString;
      const bounds = calculateBounds(coordinates.coordinates);

      map.fitBounds(bounds, {
        padding: FIT_BOUNDS_PADDING,
      });
    },
    [mapRef],
  );

  return { displayRoute };
}

