import type { Location } from "@/types/location";

export interface GooglePlaceAutocompleteSuggestion {
  placeId: string;
  text: string;
  primaryText: string;
  secondaryText?: string;
  types: string[];
}

type PlacesAutocompleteOptions = {
  locationBias?: {
    location: Location;
    radiusMeters?: number;
  };
  languageCode?: string;
  regionCode?: string;
  sessionToken?: string;
  maxResultCount?: number;
};

type PlacesAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: {
        text?: string;
      };
      structuredFormat?: {
        mainText?: {
          text?: string;
        };
        secondaryText?: {
          text?: string;
        };
      };
      types?: string[];
    };
  }>;
};

const DEFAULT_RADIUS_METERS = 30_000;
const MAX_RESULT_COUNT = 8;

function normalizeResultCount(requested?: number) {
  if (typeof requested !== "number" || Number.isNaN(requested)) {
    return MAX_RESULT_COUNT;
  }
  return Math.min(Math.max(1, Math.floor(requested)), MAX_RESULT_COUNT);
}

function normalizeRadius(requested?: number) {
  if (typeof requested !== "number" || Number.isNaN(requested)) {
    return DEFAULT_RADIUS_METERS;
  }
  return Math.max(1, Math.min(requested, 200_000));
}

export async function placesAutocomplete(
  query: string,
  apiKey: string,
  options?: PlacesAutocompleteOptions,
): Promise<GooglePlaceAutocompleteSuggestion[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const body: Record<string, unknown> = {
    input: trimmedQuery,
    languageCode: options?.languageCode ?? "ja",
    regionCode: options?.regionCode ?? "JP",
    maxResultCount: normalizeResultCount(options?.maxResultCount),
  };

  if (options?.sessionToken) {
    body.sessionToken = options.sessionToken;
  }

  if (options?.locationBias) {
    const { location, radiusMeters } = options.locationBias;
    body.locationBias = {
      circle: {
        center: {
          latitude: location.lat,
          longitude: location.lng,
        },
        radius: normalizeRadius(radiusMeters),
      },
    };
  }

  const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Places API error (${response.status}): ${errorText || response.statusText}`,
    );
  }

  const data = (await response.json()) as PlacesAutocompleteResponse;
  const suggestions = data.suggestions;
  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions
    .map((suggestion) => {
      const prediction = suggestion.placePrediction;
      if (!prediction?.placeId) {
        return null;
      }

      const text = prediction.text?.text ?? "";
      const primary = prediction.structuredFormat?.mainText?.text ?? text;
      const secondary = prediction.structuredFormat?.secondaryText?.text;

      return {
        placeId: prediction.placeId,
        text,
        primaryText: primary,
        secondaryText: secondary,
        types: prediction.types ?? [],
      } satisfies GooglePlaceAutocompleteSuggestion;
    })
    .filter((suggestion): suggestion is GooglePlaceAutocompleteSuggestion => {
      return suggestion !== null && Boolean(suggestion.text);
    });
}
