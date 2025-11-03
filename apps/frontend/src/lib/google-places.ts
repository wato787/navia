import { decode as decodePolyline } from "@mapbox/polyline";
import { BACKEND_API_URL } from "@/pages/const";
import type { Location } from "@/types/location";

/**
 * Google Places API関連のユーティリティ関数
 */

/**
 * Google Places API Autocomplete のレスポンス型
 */
export type GooglePlacesAutocompletePrediction = {
  placeId: string;
  description: string;
  structuredFormatting: {
    mainText: string;
    secondaryText: string;
  };
  types: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Google Places APIでautocomplete候補を取得（バックエンド経由）
 */
export async function googlePlacesAutocomplete(
  query: string,
  options?: {
    proximity?: Location;
    limit?: number;
  },
): Promise<GooglePlacesAutocompletePrediction[] | null> {
  try {
    const params = new URLSearchParams({
      input: query,
      limit: String(options?.limit ?? 5),
    });

    // proximity が指定されている場合はクエリパラメータに追加
    if (options?.proximity) {
      params.append("latitude", String(options.proximity.lat));
      params.append("longitude", String(options.proximity.lng));
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/places/autocomplete?${params.toString()}`,
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Backend API error:", error);
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();

    // バックエンドからのレスポンスは { data: [...] } という形式
    if (result.data && Array.isArray(result.data)) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("Google Places Autocomplete error:", error);
    return null;
  }
}

/**
 * Google Geocoding APIで住所から座標を取得（バックエンド経由）
 */
export async function geocodeAddress(
  address: string,
): Promise<Location | null> {
  try {
    const params = new URLSearchParams({
      address,
    });

    const response = await fetch(
      `${BACKEND_API_URL}/api/places/geocode?${params.toString()}`,
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Backend API error:", error);
      return null;
    }

    const result = await response.json();

    // バックエンドからのレスポンスは { data: { lat, lng } } という形式
    if (result.data && result.data.lat && result.data.lng) {
      return {
        lat: result.data.lat,
        lng: result.data.lng,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Google Directions APIで経路を取得（バックエンド経由）
 */
export async function getRoute(
  start: Location,
  end: Location,
  options?: {
    mode?: "driving" | "walking" | "bicycling" | "transit";
    alternatives?: boolean;
  },
): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const mode = options?.mode ?? "driving";
    const params = new URLSearchParams({
      originLat: String(start.lat),
      originLng: String(start.lng),
      destLat: String(end.lat),
      destLng: String(end.lng),
      mode,
      alternatives: String(options?.alternatives ?? false),
    });

    const response = await fetch(
      `${BACKEND_API_URL}/api/places/directions?${params.toString()}`,
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Backend API error:", error);
      return null;
    }

    const result = await response.json();

    // バックエンドからのレスポンスは { data: { polyline, distance, duration } } という形式
    if (result.data && result.data.polyline) {
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
    }
    return null;
  } catch (error) {
    console.error("Google Directions API error:", error);
    return null;
  }
}
