import { decode as decodePolyline } from "@mapbox/polyline";
import { GOOGLE_MAPS_API_KEY } from "@/pages/const";
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
 * Google Places API Autocomplete のリクエスト型
 */
interface AutocompleteRequest {
  input: string;
  locationBias?: {
    circle: {
      center: {
        latitude: number;
        longitude: number;
      };
      radius: number;
    };
  };
  includedRegionCodes?: string[];
  languageCode?: string;
  maxResultCount?: number;
}

/**
 * Google Places API Autocomplete のレスポンス型
 */
interface AutocompleteResponse {
  suggestions: Array<{
    placePrediction: {
      placeId: string;
      text: {
        text: string;
        matches: Array<{
          startOffset: number;
          endOffset: number;
        }>;
      };
      structuredFormat: {
        mainText: {
          text: string;
          matches: Array<{
            startOffset: number;
            endOffset: number;
          }>;
        };
        secondaryText: {
          text: string;
          matches: Array<{
            startOffset: number;
            endOffset: number;
          }>;
        };
      };
      types: string[];
    };
  }>;
}

/**
 * Google Places APIでautocomplete候補を取得
 */
export async function googlePlacesAutocomplete(
  query: string,
  options?: {
    proximity?: Location;
    limit?: number;
  },
): Promise<GooglePlacesAutocompletePrediction[] | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const request: AutocompleteRequest = {
      input: query,
      includedRegionCodes: ["JP"], // 日本に限定
      languageCode: "ja",
      maxResultCount: options?.limit ?? 5,
    };

    // proximity が指定されている場合は locationBias を追加
    if (options?.proximity) {
      request.locationBias = {
        circle: {
          center: {
            latitude: options.proximity.lat,
            longitude: options.proximity.lng,
          },
          radius: 50000, // 50km
        },
      };
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types",
        },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Google Places API error:", error);
      throw new Error(
        `Google Places API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as AutocompleteResponse;

    if (data.suggestions && Array.isArray(data.suggestions)) {
      return data.suggestions.map((suggestion) => ({
        placeId: suggestion.placePrediction.placeId,
        description: suggestion.placePrediction.text.text,
        structuredFormatting: {
          mainText: suggestion.placePrediction.structuredFormat.mainText.text,
          secondaryText:
            suggestion.placePrediction.structuredFormat.secondaryText.text,
        },
        types: suggestion.placePrediction.types,
      }));
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
