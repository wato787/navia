import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import {
  AutocompleteUsecase,
  type AutocompleteSuggestion,
} from "@/usecases/autocomplete";
import type { Location } from "@/types/location";

/**
 * Debounce付きのオートコンプリートフック
 * ユースケース層のAutocompleteUsecaseをReact Queryでラップし、UIロジック（debounce）を追加
 */
export function useSearchAutocomplete(
  query: string,
  options?: {
    proximity?: Location;
    limit?: number;
  },
) {
  const debounceMs = 500;
  const debouncedQuery = useDebounce(query, debounceMs);

  return useQuery<AutocompleteSuggestion[]>({
    queryKey: ["autocomplete", debouncedQuery, options?.proximity, options?.limit],
    queryFn: async () => {
      if (!debouncedQuery.trim()) {
        return [];
      }
      return await AutocompleteUsecase.fetchSuggestions({
        query: debouncedQuery,
        proximity: options?.proximity,
        limit: options?.limit,
      });
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}
