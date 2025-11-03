import { decode as decodePolyline } from "@mapbox/polyline";
import { BACKEND_API_URL } from "@/pages/const";
import type { Location } from "@/types/location";

/**
 * 経路検索ユースケース
 * 出発地と目的地から経路を取得する機能を提供
 */

/**
 * 移動手段の型定義
 */
export type TravelMode = "driving" | "walking" | "bicycling" | "transit";

/**
 * 経路検索のパラメータ
 */
export interface DirectionsParams {
  origin: Location;
  destination: Location;
  mode?: TravelMode;
  alternatives?: boolean;
}

/**
 * 経路データの型定義（GeoJSON形式）
 */
export interface RouteData extends GeoJSON.FeatureCollection {
  features: Array<{
    type: "Feature";
    properties: {
      distance: number;
      duration: number;
    };
    geometry: {
      type: "LineString";
      coordinates: Array<[number, number]>;
    };
  }>;
}

/**
 * バックエンドAPIのレスポンス型
 */
interface DirectionsResponse {
  data: {
    polyline: string;
    distance: number;
    duration: number;
  };
}

/**
 * 経路検索ユースケース
 */
export const DirectionsUsecase = {
  /**
   * 経路を取得
   * @param params 経路検索パラメータ
   * @returns 経路データ（GeoJSON形式）
   * @throws 経路の取得に失敗した場合
   */
  async getRoute(params: DirectionsParams): Promise<RouteData> {
    const {
      origin,
      destination,
      mode = "driving",
      alternatives = false,
    } = params;

    const queryParams = new URLSearchParams({
      originLat: String(origin.lat),
      originLng: String(origin.lng),
      destLat: String(destination.lat),
      destLng: String(destination.lng),
      mode,
      alternatives: String(alternatives),
    });

    const response = await fetch(
      `${BACKEND_API_URL}/api/places/directions?${queryParams.toString()}`,
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Directions API error:", error);
      throw new Error(`経路の取得に失敗しました: ${response.statusText}`);
    }

    const result: DirectionsResponse = await response.json();

    if (!result.data?.polyline) {
      throw new Error("経路データが見つかりませんでした");
    }

    // ポリラインをデコードしてGeoJSON形式に変換
    const polyline = result.data.polyline;
    // @mapbox/polylineのdecodeは[lat, lng]の順序で返すが、GeoJSONでは[lng, lat]が必要
    const decodedCoordinates = decodePolyline(polyline);
    const coordinates: Array<[number, number]> = decodedCoordinates.map(
      (coord) => [coord[1], coord[0]], // [lng, lat]に変換
    );

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            distance: result.data.distance,
            duration: result.data.duration,
          },
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      ],
    };
  },
};
