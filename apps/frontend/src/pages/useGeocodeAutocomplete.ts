import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import {
  type GooglePlacesAutocompletePrediction,
  googlePlacesAutocomplete,
} from "@/lib/google-places";
import type { Location } from "@/types/location";
import { GOOGLE_PLACES_API_KEY } from "./const";

/**
 * Debounce付きのGoogle Places Autocompleteフック
 */
export function useGeocodeAutocomplete(
  query: string,
  options?: {
    proximity?: Location;
    limit?: number;
  },
) {
  const debounceMs = 500;
  const debouncedQuery = useDebounce(query, debounceMs);

  const useGeocodeAutocompleteQuery = useQuery<
    GooglePlacesAutocompletePrediction[] | null
  >({
    queryKey: ["geocode-autocomplete", debouncedQuery, options?.proximity],
    queryFn: async () => {
      if (!GOOGLE_PLACES_API_KEY) {
        throw new Error("Google Places API key is not configured");
      }
      return await googlePlacesAutocomplete(
        debouncedQuery,
        GOOGLE_PLACES_API_KEY,
        {
          proximity: options?.proximity,
          limit: options?.limit,
        },
      );
    },
    enabled: debouncedQuery.trim().length > 0 && !!GOOGLE_PLACES_API_KEY,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });

  return useGeocodeAutocompleteQuery;
}
