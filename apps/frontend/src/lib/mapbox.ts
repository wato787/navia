import type { Location } from "@/types/location";

/**
 * Mapbox API関連のユーティリティ関数
 */

/**
 * Geocoding APIで住所を座標に変換
 */
export async function geocodeAddress(
  address: string,
  accessToken: string,
): Promise<Location | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address,
    )}.json?access_token=${accessToken}&limit=1&country=JP`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lng, lat };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Directions APIで経路を取得
 */
export async function getRoute(
  start: Location,
  end: Location,
  accessToken: string,
): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&steps=true&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: route.geometry,
          },
        ],
      };
    }
    return null;
  } catch (error) {
    console.error("Directions error:", error);
    return null;
  }
}

/**
 * Geocoding APIでautocomplete候補を取得
 */
export async function geocodeAutocomplete(
  query: string,
  accessToken: string,
  options?: {
    proximity?: [number, number];
    limit?: number;
  },
): Promise<MapboxGeocodeFeature[] | null> {
  try {
    const params = new URLSearchParams({
      access_token: accessToken,
      autocomplete: "true",
      language: "ja",
      limit: String(options?.limit ?? 5),
    });

    if (options?.proximity) {
      params.append(
        "proximity",
        `${options.proximity[0]},${options.proximity[1]}`,
      );
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query,
    )}.json?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && Array.isArray(data.features)) {
      return data.features;
    }
    return null;
  } catch (error) {
    console.error("Geocoding autocomplete error:", error);
    return null;
  }
}

/**
 * GeoJSONの座標からバウンディングボックスを計算
 */
export function calculateBounds(
  coordinates: GeoJSON.Position[],
): [[number, number], [number, number]] {
  return coordinates.reduce(
    (bounds, coord) => {
      return [
        [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
        [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
      ];
    },
    [
      [Infinity, Infinity],
      [-Infinity, -Infinity],
    ] as [[number, number], [number, number]],
  );
}

/**
 * Mapbox Geocoding APIのレスポンス型
 */
export interface MapboxGeocodeFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: {
    accuracy?: string;
    [key: string]: unknown;
  };
  text: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
    [key: string]: unknown;
  }>;
}
