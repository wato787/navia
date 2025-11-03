import { useDebounce } from "@/hooks/useDebounce";
import { useAutocomplete } from "@/usecases/autocomplete";
import type { Location } from "@/types/location";

/**
 * Debounce付きのオートコンプリートフック
 * ユースケース層のuseAutocompleteをラップして、UIロジック（debounce）を追加
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

  return useAutocomplete(debouncedQuery, options);
}
