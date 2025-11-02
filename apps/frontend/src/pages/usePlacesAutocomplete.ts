import { useQuery } from "@tanstack/react-query";
import {
  getPlacesAutocomplete,
  type GooglePlaceAutocompletePrediction,
} from "@/api/googlePlaces";
import { useDebounce } from "@/hooks/useDebounce";
import { GOOGLE_MAPS_API_KEY } from "./const";
import type { Location } from "@/types/location";

type UsePlacesAutocompleteOptions = {
  proximity?: Location;
  radius?: number;
};

export function usePlacesAutocomplete(
  query: string,
  options?: UsePlacesAutocompleteOptions,
) {
  const debounceMs = 400;
  const debouncedQuery = useDebounce(query, debounceMs);

  const proximityParam = options?.proximity
    ? ([options.proximity.lat, options.proximity.lng] as [number, number])
    : undefined;

  return useQuery<GooglePlaceAutocompletePrediction[]>({
    queryKey: [
      "google-places-autocomplete",
      debouncedQuery,
      proximityParam?.[0],
      proximityParam?.[1],
      options?.radius,
    ],
    queryFn: async () => {
      if (!GOOGLE_MAPS_API_KEY) {
        throw new Error("Google Maps API key is not configured");
      }

      return await getPlacesAutocomplete(debouncedQuery, GOOGLE_MAPS_API_KEY, {
        location: proximityParam,
        radius: options?.radius,
      });
    },
    initialData: [],
    placeholderData: (previousData) => previousData ?? [],
    enabled: debouncedQuery.trim().length > 0 && !!GOOGLE_MAPS_API_KEY,
    staleTime: 1000 * 60 * 5,
  });
}

