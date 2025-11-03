import { z } from "zod";

/**
 * Google Directions API ???????
 */
export const DirectionsQuerySchema = z.object({
  originLat: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= -90 && val <= 90, {
      message: "???-90??90????????????",
    }),
  originLng: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= -180 && val <= 180, {
      message: "???-180??180????????????",
    }),
  destLat: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= -90 && val <= 90, {
      message: "???-90??90????????????",
    }),
  destLng: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= -180 && val <= 180, {
      message: "???-180??180????????????",
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
 * Google Directions API ??????
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
