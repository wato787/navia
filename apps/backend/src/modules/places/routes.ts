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
  latitude: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine(
      (val) => val === undefined || (Number.isFinite(val) && val >= -90 && val <= 90),
      { message: "??????-90??90?????????????" },
    ),
  longitude: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine(
      (val) => val === undefined || (Number.isFinite(val) && val >= -180 && val <= 180),
      { message: "??????-180??180?????????????" },
    ),
  radius: z
    .string()
    .default("50000")
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= 0 && val <= 50000, {
      message: "?????0??50000?????????????",
    }),
  limit: z
    .string()
    .default("5")
    .transform((val) => Number(val))
    .refine(
      (val) => Number.isFinite(val) && Number.isInteger(val) && val >= 1 && val <= 5,
      { message: "????1??5?????????" },
    ),
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

/**
 * Google Geocoding API ????????
 */
const GeocodeQuerySchema = z.object({
  address: z.string().min(1, "??????????"),
});

/**
 * Google Geocoding API ???????
 */
type GeocodeResponse = {
  status: string;
  results?: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
}

/**
 * GET /api/places/geocode
 * Google Geocoding API ??????????
 */
places.get(
  "/geocode",
  validateQuery(GeocodeQuerySchema),
  async (c) => {
    const { address } = c.req.valid("query");

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${ENV.GOOGLE_MAPS_API_KEY}&region=JP&language=ja`;
      const response = await fetch(url);
      const data = (await response.json()) as GeocodeResponse;

      if (data.status !== "OK") {
        console.error("Google Geocoding API error:", data.status);
        return c.json(
          {
            error: {
              message: `Google Geocoding API error: ${data.status}`,
            },
          },
          500,
        );
      }

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return ok(c, {
          lat: location.lat,
          lng: location.lng,
        });
      }

      return c.json(
        {
          error: {
            message: "No results found",
          },
        },
        404,
      );
    } catch (error) {
      console.error("Google Geocoding error:", error);
      return c.json(
        {
          error: {
            message: "Failed to geocode address",
          },
        },
        500,
      );
    }
  },
);

/**
 * Google Directions API ????????
 */
const DirectionsQuerySchema = z.object({
  originLat: z
    .string()
    .transform((val) => Number(val))
    .refine(
      (val) => Number.isFinite(val) && val >= -90 && val <= 90,
      { message: "??????-90??90?????????????" },
    ),
  originLng: z
    .string()
    .transform((val) => Number(val))
    .refine(
      (val) => Number.isFinite(val) && val >= -180 && val <= 180,
      { message: "??????-180??180?????????????" },
    ),
  destLat: z
    .string()
    .transform((val) => Number(val))
    .refine(
      (val) => Number.isFinite(val) && val >= -90 && val <= 90,
      { message: "??????-90??90?????????????" },
    ),
  destLng: z
    .string()
    .transform((val) => Number(val))
    .refine(
      (val) => Number.isFinite(val) && val >= -180 && val <= 180,
      { message: "??????-180??180?????????????" },
    ),
  mode: z
    .enum(["driving", "walking", "bicycling", "transit"])
    .default("driving"),
  alternatives: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false as unknown as string),
});

/**
 * Google Directions API ???????
 */
type DirectionsResponse = {
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
}

/**
 * GET /api/places/directions
 * Google Directions API ??????????
 */
places.get(
  "/directions",
  validateQuery(DirectionsQuerySchema),
  async (c) => {
    const { originLat, originLng, destLat, destLng, mode, alternatives } =
      c.req.valid("query");

    try {
      const origin = `${originLat},${originLng}`;
      const destination = `${destLat},${destLng}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&alternatives=${alternatives}&key=${ENV.GOOGLE_MAPS_API_KEY}&region=JP&language=ja`;

      const response = await fetch(url);
      const data = (await response.json()) as DirectionsResponse;

      if (data.status !== "OK") {
        console.error("Google Directions API error:", data.status);
        return c.json(
          {
            error: {
              message: `Google Directions API error: ${data.status}`,
            },
          },
          500,
        );
      }

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return ok(c, {
          polyline: route.overview_polyline.points,
          distance: route.legs[0]?.distance?.text,
          duration: route.legs[0]?.duration?.text,
        });
      }

      return c.json(
        {
          error: {
            message: "No routes found",
          },
        },
        404,
      );
    } catch (error) {
      console.error("Google Directions error:", error);
      return c.json(
        {
          error: {
            message: "Failed to get directions",
          },
        },
        500,
      );
    }
  },
);

export default places;
