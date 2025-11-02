import type { Location } from "@/types/location";

/**
 * Google Places API関連のユーティリティ関数
 */

/**
 * Google Places API Autocomplete のレスポンス型
 */
export interface GooglePlacesAutocompletePrediction {
  placeId: string;
  description: string;
  structuredFormatting: {
    mainText: string;
    secondaryText: string;
  };
  types: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Google Places API Autocomplete のリクエスト型
 */
interface AutocompleteRequest {
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
 * Google Places API Autocomplete のレスポンス型
 */
interface AutocompleteResponse {
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
 * Google Places APIでautocomplete候補を取得
 */
export async function googlePlacesAutocomplete(
  query: string,
  apiKey: string,
  options?: {
    proximity?: Location;
    limit?: number;
  },
): Promise<GooglePlacesAutocompletePrediction[] | null> {
  try {
    const request: AutocompleteRequest = {
      input: query,
      includedRegionCodes: ["JP"], // 日本に限定
      languageCode: "ja",
      maxResultCount: options?.limit ?? 5,
    };

    // proximity が指定されている場合は locationBias を追加
    if (options?.proximity) {
      request.locationBias = {
        circle: {
          center: {
            latitude: options.proximity.lat,
            longitude: options.proximity.lng,
          },
          radius: 50000, // 50km
        },
      };
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types",
        },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Google Places API error:", error);
      throw new Error(
        `Google Places API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as AutocompleteResponse;

    if (data.suggestions && Array.isArray(data.suggestions)) {
      return data.suggestions.map((suggestion) => ({
        placeId: suggestion.placePrediction.placeId,
        description: suggestion.placePrediction.text.text,
        structuredFormatting: {
          mainText: suggestion.placePrediction.structuredFormat.mainText.text,
          secondaryText:
            suggestion.placePrediction.structuredFormat.secondaryText.text,
        },
        types: suggestion.placePrediction.types,
      }));
    }
    return null;
  } catch (error) {
    console.error("Google Places Autocomplete error:", error);
    return null;
  }
}
