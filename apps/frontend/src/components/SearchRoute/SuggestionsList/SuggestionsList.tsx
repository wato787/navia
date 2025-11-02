import { Loader2 } from "lucide-react";
import { usePlacesAutocomplete } from "@/pages/usePlacesAutocomplete";
import type { GooglePlaceAutocompletePrediction } from "@/api/googlePlaces";
import type { Location } from "@/types/location";

type SuggestionsListProps = {
  query: string;
  currentLocation?: Location | null;
  onSuggestionClick: (suggestion: GooglePlaceAutocompletePrediction) => void;
};

export function SuggestionsList({
  query,
  currentLocation,
  onSuggestionClick,
}: SuggestionsListProps) {
  const { data: suggestions = [], isLoading } = usePlacesAutocomplete(query, {
    proximity: currentLocation ?? undefined,
    radius: 5000,
  });

  const showSuggestions =
    query.trim().length > 0 && (suggestions.length > 0 || isLoading);

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
      {!isLoading && suggestions.length > 0 && (
        <ul className="py-1">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => onSuggestionClick(suggestion)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  onSuggestionClick(suggestion);
                }
              }}
              className="px-4 py-3 cursor-pointer transition-colors hover:bg-blue-50"
            >
              <div className="font-medium text-gray-900">
                {suggestion.structured_formatting?.main_text ?? suggestion.description}
              </div>
              {suggestion.structured_formatting?.secondary_text && (
                <div className="text-sm text-gray-500 mt-0.5">
                  {suggestion.structured_formatting.secondary_text}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {!isLoading && suggestions.length === 0 && query.trim().length > 0 && (
        <div className="px-4 py-3 text-sm text-gray-500">
          候補が見つかりませんでした
        </div>
      )}
    </div>
  );
}
