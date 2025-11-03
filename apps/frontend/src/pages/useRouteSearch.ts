import { useMutation } from "@tanstack/react-query";
import type { MapRef } from "react-map-gl/mapbox";
import { GeocodeUsecase } from "@/usecases/GeocodeUsecase";
import { DirectionsUsecase } from "@/usecases/DirectionsUsecase";
import type { Location } from "@/types/location";
import { INITIAL_VIEW_STATE } from "./const";
import { useRouteDisplay } from "./useRouteDisplay";

type RouteSearchParams = {
  destination: string;
  currentLocation: Location | null;
};

/**
 * 目的地検索と経路表示を管理するフック
 */
export function useRouteSearch(
  mapRef: React.RefObject<MapRef | null>,
  currentLocation: Location | null,
) {
  const { displayRoute } = useRouteDisplay(mapRef);

  const mutation = useMutation({
    mutationFn: async ({ destination }: RouteSearchParams) => {
      // 目的地を座標に変換
      const destinationCoords = await GeocodeUsecase.geocode({
        address: destination,
      });

      // 現在地が取得できていない場合は、初期位置を使用
      const startCoords = currentLocation || {
        lat: INITIAL_VIEW_STATE.latitude,
        lng: INITIAL_VIEW_STATE.longitude,
      };

      // 経路を取得
      const route = await DirectionsUsecase.getRoute({
        origin: startCoords,
        destination: destinationCoords,
        mode: "driving",
      });

      return route;
    },
    onSuccess: async (route) => {
      // 経路を地図上に表示
      await displayRoute(route);
    },
    onError: (error: Error) => {
      alert(error.message || "エラーが発生しました");
    },
  });

  return mutation;
}
