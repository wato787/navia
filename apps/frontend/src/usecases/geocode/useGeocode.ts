import { useMutation } from "@tanstack/react-query";
import type { Location } from "@/types/location";
import { BACKEND_API_URL } from "@/pages/const";

/**
 * ??????????????
 * ???????????
 */

interface GeocodeParams {
  address: string;
}

interface GeocodeResponse {
  data: {
    lat: number;
    lng: number;
  };
}

/**
 * ??????API?????????????????
 */
async function geocodeAddress(address: string): Promise<Location> {
  const params = new URLSearchParams({ address });

  const response = await fetch(
    `${BACKEND_API_URL}/api/places/geocode?${params.toString()}`,
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Geocode API error:", error);
    throw new Error(`???????????????: ${response.statusText}`);
  }

  const result: GeocodeResponse = await response.json();

  if (!result.data?.lat || !result.data?.lng) {
    throw new Error("?????????????");
  }

  return {
    lat: result.data.lat,
    lng: result.data.lng,
  };
}

/**
 * ????????????????????
 */
export function useGeocode() {
  return useMutation({
    mutationFn: async ({ address }: GeocodeParams) => {
      return await geocodeAddress(address);
    },
    onError: (error: Error) => {
      console.error("Geocode error:", error);
    },
  });
}
