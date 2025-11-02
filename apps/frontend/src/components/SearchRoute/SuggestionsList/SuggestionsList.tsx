import { Loader2, TriangleAlert } from "lucide-react";
import { usePlacesAutocomplete } from "@/pages/usePlacesAutocomplete";
import type { GooglePlaceAutocompleteSuggestion } from "@/lib/googlePlaces";
import type { Location } from "@/types/location";

type SuggestionsListProps = {
  query: string;
  currentLocation?: Location | null;
  onSuggestionClick: (suggestion: GooglePlaceAutocompleteSuggestion) => void;
};

export function SuggestionsList({
  query,
  currentLocation,
  onSuggestionClick,
}: SuggestionsListProps) {
  const {
    data: suggestions,
    isLoading,
    isError,
    error,
    resetSessionToken,
  } = usePlacesAutocomplete(query, {
    proximity: currentLocation ?? undefined,
    limit: 5,
    radiusMeters: 20_000,
  });

  const showSuggestions =
    query.trim().length > 0 && (suggestions.length > 0 || isLoading || isError);

  if (!showSuggestions) {
    return null;
  }

  const handleSelect = (suggestion: GooglePlaceAutocompleteSuggestion) => {
    onSuggestionClick(suggestion);
    resetSessionToken();
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-20">
      {isLoading && (
        <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          検索中...
        </div>
      )}
      {!isLoading && !isError && suggestions.length > 0 && (
        <ul className="py-1">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.placeId}
              onClick={() => handleSelect(suggestion)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  handleSelect(suggestion);
                }
              }}
              role="button"
              tabIndex={0}
              className="px-4 py-3 cursor-pointer transition-colors hover:bg-blue-50"
            >
              <div className="font-medium text-gray-900">
                {suggestion.primaryText}
              </div>
              {suggestion.secondaryText && (
                <div className="text-sm text-gray-500 mt-0.5">
                  {suggestion.secondaryText}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {!isLoading && !isError && suggestions.length === 0 && query.trim().length > 0 && (
          <div className="px-4 py-3 text-sm text-gray-500">
            候補が見つかりませんでした
          </div>
        )}
      {isError && (
        <div className="px-4 py-3 text-sm text-red-500 flex items-center gap-2">
          <TriangleAlert className="h-4 w-4" />
          {error instanceof Error
            ? error.message
            : "サジェストの取得に失敗しました"}
        </div>
      )}
    </div>
  );
}
