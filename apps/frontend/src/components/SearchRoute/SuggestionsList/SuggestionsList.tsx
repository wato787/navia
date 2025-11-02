import { Loader2 } from "lucide-react";
import { useGeocodeAutocomplete } from "@/pages/useGeocodeAutocomplete";
import type { MapboxGeocodeFeature } from "@/lib/mapbox";
import { Location } from "@/types/location";

type SuggestionsListProps = {
  query: string;
  currentLocation?: Location | null;
  onSuggestionClick: (suggestion: MapboxGeocodeFeature) => void;
};

export function SuggestionsList({
  query,
  currentLocation,
  onSuggestionClick,
}: SuggestionsListProps) {
  const { data: suggestions, isLoading } = useGeocodeAutocomplete(query, {
    proximity: currentLocation
      ? [currentLocation.lng, currentLocation.lat]
      : undefined,
    limit: 5,
  });

  const showSuggestions =
    query.trim().length > 0 && (suggestions !== null || isLoading);

  if (!showSuggestions) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-20">
      {isLoading && (
        <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          検索中...
        </div>
      )}
      {!isLoading && suggestions && suggestions.length > 0 && (
        <ul className="py-1">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-4 py-3 cursor-pointer transition-colors hover:bg-blue-50"
            >
              <div className="font-medium text-gray-900">{suggestion.text}</div>
              {suggestion.place_name !== suggestion.text && (
                <div className="text-sm text-gray-500 mt-0.5">
                  {suggestion.place_name}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {!isLoading &&
        suggestions &&
        suggestions.length === 0 &&
        query.trim().length > 0 && (
          <div className="px-4 py-3 text-sm text-gray-500">
            候補が見つかりませんでした
          </div>
        )}
    </div>
  );
}
