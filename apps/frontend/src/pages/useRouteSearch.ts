import { useMutation } from "@tanstack/react-query";
import type { MapRef } from "react-map-gl/mapbox";
import { INITIAL_VIEW_STATE } from "./const";
import { MAPBOX_TOKEN } from "@/config/env";
import { getRoute } from "@/lib/mapbox";
import { useRouteDisplay } from "./useRouteDisplay";
import type { Location } from "@/types/location";
import type { DestinationSelection } from "@/components/SearchRoute";
import {
  getPlaceDetails,
  geocodeAddressWithGoogle,
} from "@/api/googlePlaces";

type RouteSearchParams = {
  destination: DestinationSelection;
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
    mutationFn: async ({ destination, currentLocation: currentLocationParam }: RouteSearchParams) => {
      if (!MAPBOX_TOKEN) {
        throw new Error("Mapbox token is not configured");
      }

      // 目的地を座標に変換
      let destinationCoords: Location | null = null;

      if (destination.placeId) {
        const place = await getPlaceDetails(destination.placeId);

        if (place) {
          destinationCoords = { lat: place.lat, lng: place.lng };
        }
      }

      if (!destinationCoords && destination.description.trim().length > 0) {
        const geocoded = await geocodeAddressWithGoogle(
          destination.description,
        );

        if (geocoded) {
          destinationCoords = { lat: geocoded.lat, lng: geocoded.lng };
        }
      }

      if (!destinationCoords) {
        throw new Error("目的地が見つかりませんでした");
      }

      // 現在地が取得できていない場合は、初期位置を使用
      const startCoords = currentLocationParam || currentLocation || {
        lat: INITIAL_VIEW_STATE.latitude,
        lng: INITIAL_VIEW_STATE.longitude,
      };

      // 経路を取得
      const route = await getRoute(
        startCoords,
        destinationCoords as Location,
        MAPBOX_TOKEN,
      );
      if (!route) {
        throw new Error("経路を取得できませんでした");
      }

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
