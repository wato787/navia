import type { Location } from "@/types/location";
import { BACKEND_API_URL } from "@/pages/const";

/**
 * ジオコーディングユースケース
 * 住所から座標を取得する機能を提供
 */

/**
 * ジオコーディングのパラメータ
 */
export interface GeocodeParams {
  address: string;
}

/**
 * バックエンドAPIのレスポンス型
 */
interface GeocodeResponse {
  data: {
    lat: number;
    lng: number;
  };
}

/**
 * ジオコーディングユースケース
 */
export const GeocodeUsecase = {
  /**
   * 住所から座標を取得
   * @param params ジオコーディングパラメータ
   * @returns 座標（緯度経度）
   * @throws ジオコーディングに失敗した場合
   */
  async geocode(params: GeocodeParams): Promise<Location> {
    const { address } = params;
    const queryParams = new URLSearchParams({ address });

    const response = await fetch(
      `${BACKEND_API_URL}/api/places/geocode?${queryParams.toString()}`,
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Geocode API error:", error);
      throw new Error(`ジオコーディングに失敗しました: ${response.statusText}`);
    }

    const result: GeocodeResponse = await response.json();

    if (!result.data?.lat || !result.data?.lng) {
      throw new Error("座標が見つかりませんでした");
    }

    return {
      lat: result.data.lat,
      lng: result.data.lng,
    };
  },
};
