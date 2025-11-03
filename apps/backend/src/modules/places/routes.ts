import { Hono } from "hono";
import { z } from "zod";

import { ENV } from "../../config/env";
import { validateQuery } from "../../plugins/validator";
import type { AppBindings } from "../../types/app";
import { ok } from "../../utils/response";

const places = new Hono<AppBindings>();

/**
 * Google Places API Autocomplete ????????
 */
const AutocompleteQuerySchema = z.object({
  input: z.string().min(1, "??????????"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  radius: z.coerce.number().default(50000),
  limit: z.coerce.number().default(5),
});

/**
 * Google Places API Autocomplete ???????
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
}

/**
 * Google Places API Autocomplete ???????
 */
type GooglePlacesAutocompletePrediction = {
  placeId: string;
  description: string;
  structuredFormatting: {
    mainText: string;
    secondaryText: string;
  };
  types: string[];
}

/**
 * Google Places API Autocomplete ???????
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
}

/**
 * GET /api/places/autocomplete
 * Google Places API Autocomplete ??????????
 */
places.get(
  "/autocomplete",
  validateQuery(AutocompleteQuerySchema),
  async (c) => {
    const { input, latitude, longitude, radius, limit } =
      c.req.valid("query");

    try {
      const request: AutocompleteRequest = {
        input,
        includedRegionCodes: ["JP"], // ?????
        languageCode: "ja",
        maxResultCount: limit,
      };

      // latitude ? longitude ????????????? locationBias ???
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
        const predictions: GooglePlacesAutocompletePrediction[] =
          data.suggestions.map((suggestion) => ({
            placeId: suggestion.placePrediction.placeId,
            description: suggestion.placePrediction.text.text,
            structuredFormatting: {
              mainText: suggestion.placePrediction.structuredFormat.mainText.text,
              secondaryText:
                suggestion.placePrediction.structuredFormat.secondaryText.text,
            },
            types: suggestion.placePrediction.types,
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
  },
);

export default places;
