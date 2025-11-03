import { z } from "zod";

/**
 * Google Geocoding API クエリスキーマ
 */
export const GeocodeQuerySchema = z.object({
  address: z.string().min(1, "住所は必須です"),
});

/**
 * Google Geocoding API レスポンス型
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
