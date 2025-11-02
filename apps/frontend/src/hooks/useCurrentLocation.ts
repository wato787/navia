import { useState, useEffect, useCallback, useEffectEvent } from "react";
import type { MapRef } from "react-map-gl/mapbox";

/**
 * 現在地を管理するフック
 * GeolocateControlのイベントをリッスンして現在地を更新します
 */
export function useCurrentLocation(
  mapRef: React.RefObject<MapRef | null>,
  initialLocation: [number, number] | null = null,
) {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(
    initialLocation,
  );

  // geolocateイベントハンドラー（useEffectEventで最新のsetCurrentLocationにアクセス）
  const onGeolocate = useEffectEvent(
    (e: { coords: { longitude: number; latitude: number } }) => {
      const coords: [number, number] = [e.coords.longitude, e.coords.latitude];
      setCurrentLocation(coords);
    },
  );

  // mapのloadイベントでgeolocateイベントをリッスン
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.on("geolocate", onGeolocate);
  }, [mapRef, onGeolocate]);

  // mapがロードされたときにイベントリスナーを設定
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (map && map.loaded()) {
      handleMapLoad();
      return () => {
        map.off("geolocate", onGeolocate);
      };
    } else if (map) {
      map.on("load", handleMapLoad);
      return () => {
        map.off("load", handleMapLoad);
        map.off("geolocate", onGeolocate);
      };
    }
  }, [handleMapLoad, onGeolocate, mapRef]);

  return { currentLocation, setCurrentLocation };
}

