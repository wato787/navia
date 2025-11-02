import { useQuery } from "@tanstack/react-query";
import { MAPBOX_TOKEN } from "./const";
import { geocodeAutocomplete, type MapboxGeocodeFeature } from "@/lib/mapbox";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Debounce付きのGeocoding Autocompleteフック
 */
export function useGeocodeAutocomplete(
  query: string,
  options?: {
    proximity?: [number, number];
    limit?: number;
  },
) {
  const debounceMs =  500;
  const debouncedQuery = useDebounce(query, debounceMs);

  const useGeocodeAutocompleteQuery = useQuery<MapboxGeocodeFeature[] | null>({
    queryKey: ["geocode-autocomplete", debouncedQuery, options?.proximity],
    queryFn: async () => {
      if (!MAPBOX_TOKEN) {
        throw new Error("Mapbox token is not configured");
      }
      return await geocodeAutocomplete(debouncedQuery, MAPBOX_TOKEN, {
        proximity: options?.proximity,
        limit: options?.limit,
      });
    },
    enabled:
      debouncedQuery.trim().length > 0 &&
      !!MAPBOX_TOKEN,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });

  return useGeocodeAutocompleteQuery
}
