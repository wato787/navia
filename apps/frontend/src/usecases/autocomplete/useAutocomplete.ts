import { useQuery } from "@tanstack/react-query";
import type { Location } from "@/types/location";
import { BACKEND_API_URL } from "@/pages/const";

/**
 * ???????????????
 * ????????????????????
 */

/**
 * ???????????????
 */
export interface AutocompleteSuggestion {
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

interface AutocompleteOptions {
  proximity?: Location;
  limit?: number;
}

interface AutocompleteResponse {
  data: AutocompleteSuggestion[];
}

/**
 * ??????API????????????????????
 */
async function fetchAutocompleteSuggestions(
  query: string,
  options?: AutocompleteOptions,
): Promise<AutocompleteSuggestion[]> {
  const params = new URLSearchParams({
    input: query,
    limit: String(options?.limit ?? 5),
  });

  // proximity ??????????????????????
  if (options?.proximity) {
    params.append("latitude", String(options.proximity.lat));
    params.append("longitude", String(options.proximity.lng));
  }

  const response = await fetch(
    `${BACKEND_API_URL}/api/places/autocomplete?${params.toString()}`,
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Autocomplete API error:", error);
    throw new Error(
      `???????????????????: ${response.statusText}`,
    );
  }

  const result: AutocompleteResponse = await response.json();

  if (!Array.isArray(result.data)) {
    throw new Error("??????????");
  }

  return result.data;
}

/**
 * ???????????????????????
 */
export function useAutocomplete(query: string, options?: AutocompleteOptions) {
  return useQuery({
    queryKey: ["autocomplete", query, options?.proximity, options?.limit],
    queryFn: async () => {
      if (!query.trim()) {
        return [];
      }
      return await fetchAutocompleteSuggestions(query, options);
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5???????
  });
}
