import { Hono } from "hono";
import { z } from "zod";

import { ENV } from "../../../config/env";
import { validateQuery } from "../../../plugins/validator";
import type { AppBindings } from "../../../types/app";
import { ok } from "../../../utils/response";

const autocomplete = new Hono<AppBindings>();

/**
 * Google Places API Autocomplete ???????
 */
const AutocompleteQuerySchema = z.object({
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
      { message: "???1??5????????????" },
    ),
});

/**
 * Google Places API Autocomplete ??????
 */
type AutocompleteResponse = {
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
type GooglePlacesAutocompletePrediction = {
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
type AutocompleteRequest = {
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

/**
 * GET /autocomplete
 * Google Places API Autocomplete ????????????
 */
autocomplete.get("/", validateQuery(AutocompleteQuerySchema), async (c) => {
  const { input, latitude, longitude, radius, limit } = c.req.valid("query");

  try {
    const request: AutocompleteRequest = {
      input,
      includedRegionCodes: ["JP"], // ????
      languageCode: "ja",
      maxResultCount: limit,
    };

    // latitude ? longitude ??????????? locationBias ???
    if (latitude !== undefined && longitude !== undefined) {
      request.locationBias = {
        circle: {
          center: {
            latitude,
            longitude,
          },
          radius,
        },
      };
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": ENV.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types",
        },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Google Places API error:", error);
      return c.json(
        {
          error: {
            message: `Google Places API error: ${response.status} ${response.statusText}`,
          },
        },
        500,
      );
    }

    const data = (await response.json()) as AutocompleteResponse;

    if (data.suggestions && Array.isArray(data.suggestions)) {
      const predictions: GooglePlacesAutocompletePrediction[] = data.suggestions
        .filter((suggestion) => suggestion.placePrediction)
        .map((suggestion) => ({
          placeId: suggestion.placePrediction.placeId,
          description: suggestion.placePrediction.text?.text ?? "",
          structuredFormatting: {
            mainText:
              suggestion.placePrediction.structuredFormat?.mainText?.text ?? "",
            secondaryText:
              suggestion.placePrediction.structuredFormat?.secondaryText
                ?.text ?? "",
          },
          types: suggestion.placePrediction.types ?? [],
        }));

      return ok(c, predictions);
    }

    return ok(c, []);
  } catch (error) {
    console.error("Google Places Autocomplete error:", error);
    return c.json(
      {
        error: {
          message: "Failed to fetch autocomplete suggestions",
        },
      },
      500,
    );
  }
});

export default autocomplete;
