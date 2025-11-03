import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import type { Location } from "@/types/location";
import { AutocompleteUsecase } from "@/usecases/AutocompleteUsecase";

/**
 * Debounce付きのオートコンプリートフック
 * ユースケース層のAutocompleteUsecaseを使用
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

  return useQuery({
    queryKey: ["autocomplete", debouncedQuery, options?.proximity],
    queryFn: async () => {
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
