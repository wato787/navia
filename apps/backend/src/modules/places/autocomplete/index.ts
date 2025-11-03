import { Hono } from "hono";

import { ENV } from "../../../config/env";
import { validateQuery } from "../../../plugins/validator";
import type { AppBindings } from "../../../types/app";
import { ok } from "../../../utils/response";
import {
  AutocompleteQuerySchema,
  type AutocompleteRequest,
  type AutocompleteResponse,
  type GooglePlacesAutocompletePrediction,
} from "./schema";

const autocomplete = new Hono<AppBindings>();

/**
 * GET /autocomplete
 * Google Places API Autocomplete を使用して予測候補を取得
 */
autocomplete.get("/", validateQuery(AutocompleteQuerySchema), async (c) => {
  const { input, latitude, longitude, radius, limit } = c.req.valid("query");

  try {
    const request: AutocompleteRequest = {
      input,
      includedRegionCodes: ["JP"], // 日本限定
      languageCode: "ja",
      maxResultCount: limit,
    };

    // latitude と longitude の両方が指定されている場合のみ locationBias を追加
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
            message: \`Google Places API error: \${response.status} \${response.statusText}\`,
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
