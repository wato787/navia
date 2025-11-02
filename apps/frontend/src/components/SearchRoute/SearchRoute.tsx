import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { SuggestionsList } from "./SuggestionsList";
import type { GooglePlaceAutocompletePrediction } from "@/api/googlePlaces";
import type { Location } from "@/types/location";

type SearchRouteProps = {
  onSearch?: (destination: DestinationSelection) => void;
  currentLocation?: Location | null;
};

export type DestinationSelection = {
  description: string;
  placeId?: string;
};

export function SearchRoute({ onSearch, currentLocation }: SearchRouteProps) {
  const [value, setValue] = useState<string>("");
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<GooglePlaceAutocompletePrediction | null>(null);

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
    setSelectedSuggestion((prev) =>
      prev && prev.description !== nextValue ? null : prev,
    );
  };

  const handleSearch = (destination: string) => {
    if (onSearch) {
      const payload: DestinationSelection = {
        description: destination,
        placeId:
          selectedSuggestion &&
          selectedSuggestion.description === destination
            ? selectedSuggestion.place_id
            : undefined,
      };
      onSearch(payload);
    }
  };

  const handleSuggestionClick = (
    suggestion: GooglePlaceAutocompletePrediction,
  ) => {
    setSelectedSuggestion(suggestion);
    setValue(suggestion.description);
    handleSearch(suggestion.description);
  };

  return (
    <SearchBar
      value={value}
      onChange={handleValueChange}
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
