import type { MapRef } from "react-map-gl/mapbox";
import { useGeocode } from "@/usecases/geocode";
import { useDirections } from "@/usecases/directions";
import type { Location } from "@/types/location";
import { INITIAL_VIEW_STATE } from "./const";
import { useRouteDisplay } from "./useRouteDisplay";

/**
 * 目的地検索と経路表示を管理するフック
 * ユースケース層（useGeocode, useDirections）を組み合わせて使用
 */
export function useRouteSearch(
  mapRef: React.RefObject<MapRef | null>,
  currentLocation: Location | null,
) {
  const { displayRoute } = useRouteDisplay(mapRef);
  const geocodeMutation = useGeocode();
  const directionsMutation = useDirections();

  const searchRoute = async (destination: string) => {
    try {
      // 1. 目的地を座標に変換（ジオコーディングユースケース）
      const destinationCoords = await geocodeMutation.mutateAsync({
        address: destination,
      });

      // 2. 現在地が取得できていない場合は、初期位置を使用
      const startCoords = currentLocation || {
        lat: INITIAL_VIEW_STATE.latitude,
        lng: INITIAL_VIEW_STATE.longitude,
      };

      // 3. 経路を取得（経路検索ユースケース）
      const route = await directionsMutation.mutateAsync({
        origin: startCoords,
        destination: destinationCoords,
        mode: "driving",
      });

      // 4. 経路を地図上に表示
      await displayRoute(route);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "エラーが発生しました";
      alert(errorMessage);
      throw error;
    }
  };

  return {
    searchRoute,
    isLoading: geocodeMutation.isPending || directionsMutation.isPending,
    error: geocodeMutation.error || directionsMutation.error,
  };
}
