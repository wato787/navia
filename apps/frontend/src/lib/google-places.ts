import { decode as decodePolyline } from "@mapbox/polyline";
import { BACKEND_API_URL, GOOGLE_MAPS_API_KEY } from "@/pages/const";
import type { Location } from "@/types/location";

/**
 * Google Places API関連のユーティリティ関数
 */

/**
 * Google Places API Place Details のレスポンス型
 */
interface PlaceDetailsResponse {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Google Directions API のレスポンス型
 */
interface DirectionsResponse {
  status: string;
  routes?: Array<{
    legs: Array<{
      distance: {
        value: number;
        text: string;
      };
      duration: {
        value: number;
        text: string;
      };
      steps: Array<{
        startLocation: {
          lat: number;
          lng: number;
        };
        endLocation: {
          lat: number;
          lng: number;
        };
        polyline: {
          points: string;
        };
      }>;
    }>;
    overviewPolyline: {
      points: string;
    };
  }>;
}

/**
 * Google Places API Autocomplete のレスポンス型
 */
export interface GooglePlacesAutocompletePrediction {
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
 * Google Places API Place Detailsで座標を取得
 */
export async function getPlaceDetails(
  placeId: string,
): Promise<Location | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": "id,displayName,location",
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Google Places Details API error:", error);
      throw new Error(
        `Google Places Details API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as PlaceDetailsResponse;

    if (data.location) {
      return {
        lat: data.location.latitude,
        lng: data.location.longitude,
      };
    }
    return null;
  } catch (error) {
    console.error("Google Places Details error:", error);
    return null;
  }
}

/**
 * Google Geocoding APIで住所から座標を取得
 */
export async function geocodeAddress(
  address: string,
): Promise<Location | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}&region=JP&language=ja`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Google Directions APIで経路を取得
 */
export async function getRoute(
  start: Location,
  end: Location,
  options?: {
    mode?: "driving" | "walking" | "bicycling" | "transit";
    alternatives?: boolean;
  },
): Promise<GeoJSON.FeatureCollection | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const mode = options?.mode ?? "driving";
    const origin = `${start.lat},${start.lng}`;
    const destination = `${end.lat},${end.lng}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&alternatives=${options?.alternatives ?? false}&key=${GOOGLE_MAPS_API_KEY}&region=JP&language=ja`;

    const response = await fetch(url);
    const data = (await response.json()) as DirectionsResponse;

    if (data.status !== "OK") {
      console.error("Google Directions API error:", data.status);
      return null;
    }

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const polyline = route.overviewPolyline.points;
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
              distance: route.legs[0]?.distance?.text,
              duration: route.legs[0]?.duration?.text,
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
