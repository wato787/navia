import { z } from "zod";

/**
 * Google Directions API クエリスキーマ
 */
export const DirectionsQuerySchema = z.object({
  originLat: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= -90 && val <= 90, {
      message: "緯度は-90から90の範囲で指定してください",
    }),
  originLng: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= -180 && val <= 180, {
      message: "経度は-180から180の範囲で指定してください",
    }),
  destLat: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= -90 && val <= 90, {
      message: "緯度は-90から90の範囲で指定してください",
    }),
  destLng: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= -180 && val <= 180, {
      message: "経度は-180から180の範囲で指定してください",
    }),
  mode: z
    .enum(["driving", "walking", "bicycling", "transit"])
    .default("driving"),
  alternatives: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
});

/**
 * Google Directions API レスポンス型
 */
export type DirectionsResponse = {
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
    }>;
    overview_polyline: {
      points: string;
    };
  }>;
};
