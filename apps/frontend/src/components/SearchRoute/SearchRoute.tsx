import { useState } from "react";
import type { MapboxGeocodeFeature } from "@/lib/mapbox";
import type { Location } from "@/types/location";
import { SearchBar } from "./SearchBar";
import { SuggestionsList } from "./SuggestionsList";

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

  const handleSuggestionClick = (suggestion: MapboxGeocodeFeature) => {
    setValue(suggestion.place_name);
    if (onSearch) {
      onSearch(suggestion.place_name);
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
