import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import {
  type GooglePlacesAutocompletePrediction,
  googlePlacesAutocomplete,
} from "@/lib/google-places";
import type { Location } from "@/types/location";

/**
 * Debounce付きのGoogle Places Autocompleteフック
 */
export function useSearchAutocomplete(
  query: string,
  options?: {
    proximity?: Location;
    limit?: number;
  },
) {
  const debounceMs = 500;
  const debouncedQuery = useDebounce(query, debounceMs);

  const useSearchAutocompleteQuery = useQuery<
    GooglePlacesAutocompletePrediction[] | null
  >({
    queryKey: ["geocode-autocomplete", debouncedQuery, options?.proximity],
    queryFn: async () => {
      return await googlePlacesAutocomplete(debouncedQuery, {
        proximity: options?.proximity,
        limit: options?.limit,
      });
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });

  return useSearchAutocompleteQuery;
}
