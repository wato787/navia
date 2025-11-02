import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { SuggestionsList } from "./SuggestionsList";
import type { GooglePlaceAutocompleteSuggestion } from "@/lib/googlePlaces";
import type { Location } from "@/types/location";

type SearchRouteProps = {
  onSearch?: (destination: string) => void;
  currentLocation?: Location | null;
};

export function SearchRoute({ onSearch, currentLocation }: SearchRouteProps) {
  const [value, setValue] = useState<string>("");

  const handleSearch = (destination: string) => {
    if (onSearch) {
      onSearch(destination);
    }
  };

  const handleSuggestionClick = (
    suggestion: GooglePlaceAutocompleteSuggestion,
  ) => {
    const displayValue = suggestion.text
      ? suggestion.text
      : [suggestion.primaryText, suggestion.secondaryText]
          .filter(Boolean)
          .join(" ");
    setValue(displayValue);
    if (onSearch) {
      onSearch(displayValue);
    }
  };

  return (
    <SearchBar
      value={value}
      onChange={setValue}
      onSearch={handleSearch}
      placeholder="目的地を検索"
    >
      <SuggestionsList
        query={value}
        currentLocation={currentLocation}
        onSuggestionClick={handleSuggestionClick}
      />
    </SearchBar>
  );
}
