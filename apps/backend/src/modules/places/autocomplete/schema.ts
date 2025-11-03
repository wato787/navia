import { z } from "zod";

/**
 * Google Places API Autocomplete ???????
 */
export const AutocompleteQuerySchema = z.object({
  input: z.string().min(1, "???????"),
  latitude: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine(
      (val) =>
        val === undefined || (Number.isFinite(val) && val >= -90 && val <= 90),
      { message: "???-90??90????????????" },
    ),
  longitude: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine(
      (val) =>
        val === undefined ||
        (Number.isFinite(val) && val >= -180 && val <= 180),
      { message: "???-180??180????????????" },
    ),
  radius: z
    .string()
    .default("50000")
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= 0 && val <= 50000, {
      message: "???0??50000????????????",
    }),
  limit: z
    .string()
    .default("5")
    .transform((val) => Number(val))
    .refine(
      (val) =>
        Number.isFinite(val) && Number.isInteger(val) && val >= 1 && val <= 5,
      { message: "limit?1??5????????????" },
    ),
});

/**
 * Google Places API Autocomplete ??????
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
 * Google Places API Autocomplete ?????
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
 * Google Places API Autocomplete ??????
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
