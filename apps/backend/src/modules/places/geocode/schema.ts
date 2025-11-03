import { z } from "zod";

/**
 * Google Geocoding API ???????
 */
export const GeocodeQuerySchema = z.object({
  address: z.string().min(1, "???????"),
});

/**
 * Google Geocoding API ??????
 */
export type GeocodeResponse = {
  status: string;
  results?: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
};
