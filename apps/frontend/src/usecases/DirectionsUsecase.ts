import { decode as decodePolyline } from "@mapbox/polyline";
import type { Location } from "@/types/location";
import { BACKEND_API_URL } from "@/pages/const";

/**
 * ??????????
 * ?????????????????????
 */

/**
 * ????????
 */
export type TravelMode = "driving" | "walking" | "bicycling" | "transit";

/**
 * ??????????
 */
export interface DirectionsParams {
  origin: Location;
  destination: Location;
  mode?: TravelMode;
  alternatives?: boolean;
}

/**
 * ??????????GeoJSON???
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
 * ??????API???????
 */
interface DirectionsResponse {
  data: {
    polyline: string;
    distance: number;
    duration: number;
  };
}

/**
 * ??????????
 */
export const DirectionsUsecase = {
  /**
   * ?????
   * @param params ?????????
   * @returns ??????GeoJSON???
   * @throws ????????????
   */
  async getRoute(params: DirectionsParams): Promise<RouteData> {
    const { origin, destination, mode = "driving", alternatives = false } = params;

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
      throw new Error(`????????????: ${response.statusText}`);
    }

    const result: DirectionsResponse = await response.json();

    if (!result.data?.polyline) {
      throw new Error("????????????????");
    }

    // ????????????GeoJSON?????
    const polyline = result.data.polyline;
    // @mapbox/polyline?decode?[lat, lng]????????GeoJSON??[lng, lat]???
    const decodedCoordinates = decodePolyline(polyline);
    const coordinates: Array<[number, number]> = decodedCoordinates.map(
      (coord) => [coord[1], coord[0]], // [lng, lat]???
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
