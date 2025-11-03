import { useState } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import { GeocodeUsecase } from "@/usecases/geocode";
import { DirectionsUsecase } from "@/usecases/directions";
import type { Location } from "@/types/location";
import { INITIAL_VIEW_STATE } from "./const";
import { useRouteDisplay } from "./useRouteDisplay";

/**
 * 目的地検索と経路表示を管理するフック
 * ユースケース層（GeocodeUsecase, DirectionsUsecase）を組み合わせて使用
 */
export function useRouteSearch(
  mapRef: React.RefObject<MapRef | null>,
  currentLocation: Location | null,
) {
  const { displayRoute } = useRouteDisplay(mapRef);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchRoute = async (destination: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. 目的地を座標に変換（ジオコーディングユースケース）
      const destinationCoords = await GeocodeUsecase.geocode({
        address: destination,
      });

      // 2. 現在地が取得できていない場合は、初期位置を使用
      const startCoords = currentLocation || {
        lat: INITIAL_VIEW_STATE.latitude,
        lng: INITIAL_VIEW_STATE.longitude,
      };

      // 3. 経路を取得（経路検索ユースケース）
      const route = await DirectionsUsecase.getRoute({
        origin: startCoords,
        destination: destinationCoords,
        mode: "driving",
      });

      // 4. 経路を地図上に表示
      await displayRoute(route);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "エラーが発生しました";
      setError(error instanceof Error ? error : new Error(errorMessage));
      alert(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchRoute,
    isLoading,
    error,
  };
}
