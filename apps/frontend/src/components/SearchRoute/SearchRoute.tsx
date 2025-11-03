import { useState } from "react";
import type { AutocompleteSuggestion } from "@/usecases/autocomplete";
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

  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    const fullName = suggestion.structuredFormatting.secondaryText
      ? `${suggestion.structuredFormatting.mainText}, ${suggestion.structuredFormatting.secondaryText}`
      : suggestion.structuredFormatting.mainText;
    setValue(fullName);
    if (onSearch) {
      onSearch(fullName);
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
