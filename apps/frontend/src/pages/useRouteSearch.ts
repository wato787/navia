import { useCallback } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import { MAPBOX_TOKEN, INITIAL_VIEW_STATE } from "./const";
import { geocodeAddress, getRoute } from "@/lib/mapbox";
import { useRouteDisplay } from "./useRouteDisplay";

/**
 * 目的地検索と経路表示を管理するフック
 */
export function useRouteSearch(
  mapRef: React.RefObject<MapRef | null>,
  currentLocation: [number, number] | null,
) {
  const { displayRoute } = useRouteDisplay(mapRef);

  const handleDestinationSearch = useCallback(
    async (destination: string) => {
      const map = mapRef.current?.getMap();
      if (!MAPBOX_TOKEN || !map) return;

      console.log("目的地:", destination);

      // 目的地を座標に変換
      const destinationCoords = await geocodeAddress(destination, MAPBOX_TOKEN);
      if (!destinationCoords) {
        alert("目的地が見つかりませんでした");
        return;
      }

      // 現在地が取得できていない場合は、初期位置を使用
      const startCoords = currentLocation || [
        INITIAL_VIEW_STATE.longitude,
        INITIAL_VIEW_STATE.latitude,
      ] as [number, number];

      // 経路を取得
      const route = await getRoute(startCoords, destinationCoords, MAPBOX_TOKEN);
      if (!route) {
        alert("経路を取得できませんでした");
        return;
      }

      // 経路を地図上に表示
      await displayRoute(route);
    },
    [currentLocation, mapRef, displayRoute],
  );

  return { handleDestinationSearch };
}

