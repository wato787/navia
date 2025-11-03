import type { Location } from "@/types/location";
import { BACKEND_API_URL } from "@/pages/const";

/**
 * オートコンプリートユースケース
 * 入力クエリに基づいて場所の候補を取得する機能を提供
 */

/**
 * オートコンプリート候補の型定義
 */
export interface AutocompleteSuggestion {
  placeId: string;
  description: string;
  structuredFormatting: {
    mainText: string;
    secondaryText: string;
  };
  types: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * オートコンプリートのパラメータ
 */
export interface AutocompleteParams {
  query: string;
  proximity?: Location;
  limit?: number;
}

/**
 * バックエンドAPIのレスポンス型
 */
interface AutocompleteResponse {
  data: AutocompleteSuggestion[];
}

/**
 * オートコンプリートユースケース
 */
export const AutocompleteUsecase = {
  /**
   * オートコンプリート候補を取得
   * @param params オートコンプリートパラメータ
   * @returns 候補のリスト
   * @throws オートコンプリートの取得に失敗した場合
   */
  async fetchSuggestions(
    params: AutocompleteParams,
  ): Promise<AutocompleteSuggestion[]> {
    const { query, proximity, limit = 5 } = params;

    const queryParams = new URLSearchParams({
      input: query,
      limit: String(limit),
    });

    // proximity が指定されている場合はクエリパラメータに追加
    if (proximity) {
      queryParams.append("latitude", String(proximity.lat));
      queryParams.append("longitude", String(proximity.lng));
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/places/autocomplete?${queryParams.toString()}`,
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Autocomplete API error:", error);
      throw new Error(
        `オートコンプリートの取得に失敗しました: ${response.statusText}`,
      );
    }

    const result: AutocompleteResponse = await response.json();

    if (!Array.isArray(result.data)) {
      throw new Error("無効なレスポンス形式");
    }

    return result.data;
  },
};
