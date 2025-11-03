import { z } from "zod";

/**
 * Google Places API Autocomplete クエリスキーマ
 */
export const AutocompleteQuerySchema = z.object({
  input: z.string().min(1, "入力は必須です"),
  latitude: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine(
      (val) =>
        val === undefined || (Number.isFinite(val) && val >= -90 && val <= 90),
      { message: "緯度は-90から90の範囲で指定してください" },
    ),
  longitude: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine(
      (val) =>
        val === undefined ||
        (Number.isFinite(val) && val >= -180 && val <= 180),
      { message: "経度は-180から180の範囲で指定してください" },
    ),
  radius: z
    .string()
    .default("50000")
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= 0 && val <= 50000, {
      message: "半径は0から50000の範囲で指定してください",
    }),
  limit: z
    .string()
    .default("5")
    .transform((val) => Number(val))
    .refine(
      (val) =>
        Number.isFinite(val) && Number.isInteger(val) && val >= 1 && val <= 5,
      { message: "limitは1から5の範囲で指定してください" },
    ),
});

/**
 * Google Places API Autocomplete レスポンス型
 */
export type AutocompleteResponse = {
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
};

/**
 * Google Places API Autocomplete 予測結果型
 */
export type GooglePlacesAutocompletePrediction = {
  placeId: string;
  description: string;
  structuredFormatting: {
    mainText: string;
    secondaryText: string;
  };
  types: string[];
};

/**
 * Google Places API Autocomplete リクエスト型
 */
export type AutocompleteRequest = {
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
};
