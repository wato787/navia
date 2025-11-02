import { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { GOOGLE_MAPS_API_KEY } from "./const";
import {
  placesAutocomplete,
  type GooglePlaceAutocompleteSuggestion,
} from "@/lib/googlePlaces";
import { useDebounce } from "@/hooks/useDebounce";
import type { Location } from "@/types/location";

type UsePlacesAutocompleteOptions = {
  proximity?: Location;
  limit?: number;
  radiusMeters?: number;
  debounceMs?: number;
};

function generateSessionToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 10);
}

export function usePlacesAutocomplete(
  query: string,
  options?: UsePlacesAutocompleteOptions,
) {
  const debounceMs = options?.debounceMs ?? 500;
  const debouncedQuery = useDebounce(query, debounceMs);

  const sessionTokenRef = useRef<string>(generateSessionToken());
  const previousQueryRef = useRef<string>("");

  const trimmedQuery = debouncedQuery.trim();
  const prevTrimmedQuery = previousQueryRef.current.trim();

  if (trimmedQuery.length === 0 && prevTrimmedQuery.length > 0) {
    sessionTokenRef.current = generateSessionToken();
  }

  previousQueryRef.current = debouncedQuery;

  const locationBias = useMemo(() => {
    if (!options?.proximity) {
      return undefined;
    }
    return {
      location: options.proximity,
      radiusMeters: options.radiusMeters,
    } as const;
  }, [options?.proximity, options?.radiusMeters]);

  const queryResult = useQuery<GooglePlaceAutocompleteSuggestion[]>({
    queryKey: [
      "places-autocomplete",
      trimmedQuery,
      locationBias?.location.lat,
      locationBias?.location.lng,
      locationBias?.radiusMeters,
      sessionTokenRef.current,
      options?.limit,
    ],
    queryFn: async () => {
      if (!GOOGLE_MAPS_API_KEY) {
        throw new Error("Google Maps API key is not configured");
      }

      return await placesAutocomplete(trimmedQuery, GOOGLE_MAPS_API_KEY, {
        sessionToken: sessionTokenRef.current,
        locationBias,
        maxResultCount: options?.limit,
      });
    },
    enabled: trimmedQuery.length > 0 && Boolean(GOOGLE_MAPS_API_KEY),
    staleTime: 1000 * 60 * 5,
  });

  const resetSessionToken = () => {
    sessionTokenRef.current = generateSessionToken();
  };

  return {
    ...queryResult,
    data: queryResult.data ?? [],
    sessionToken: sessionTokenRef.current,
    resetSessionToken,
  };
}
