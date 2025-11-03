import { beforeEach, describe, expect, it, vi } from "vitest";
import { GeocodeUsecase, type GeocodeParams } from "../GeocodeUsecase";
import type { Location } from "@/types/location";

// fetchのモック
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as typeof fetch;

describe("GeocodeUsecase", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("geocode", () => {
    it("正常に住所から座標を取得できる", async () => {
      const mockLocation: Location = {
        lat: 35.681236,
        lng: 139.767125,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockLocation,
        }),
      });

      const result = await GeocodeUsecase.geocode({
        address: "東京駅",
      });

      expect(result).toEqual(mockLocation);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/places/geocode"),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("address="),
      );
    });

    it("住所をエンコードしてクエリパラメータに含める", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { lat: 35.681236, lng: 139.767125 },
        }),
      });

      await GeocodeUsecase.geocode({
        address: "東京都千代田区丸の内",
      });

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("/api/places/geocode?");
      // URLエンコードされた住所が含まれている
      expect(decodeURIComponent(callUrl)).toContain("東京都千代田区丸の内");
    });

    it("英語の住所も正常に処理できる", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { lat: 40.7128, lng: -74.006 },
        }),
      });

      const result = await GeocodeUsecase.geocode({
        address: "New York, NY",
      });

      expect(result).toEqual({ lat: 40.7128, lng: -74.006 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("address=New+York"),
      );
    });

    it("空の住所でもAPIリクエストを行う", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { lat: 1, lng: 1 },
        }),
      });

      const result = await GeocodeUsecase.geocode({ address: "" });

      expect(result).toEqual({ lat: 1, lng: 1 });
      expect(mockFetch).toHaveBeenCalled();
    });

    it("APIレスポンスがエラーの場合、エラーをスローする", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
        json: async () => ({ error: "Invalid address" }),
      });

      await expect(
        GeocodeUsecase.geocode({ address: "invalid address" }),
      ).rejects.toThrow();
    });

    it("緯度が存在しない場合、エラーをスローする", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { lng: 139.767125 },
        }),
      });

      await expect(
        GeocodeUsecase.geocode({ address: "test" }),
      ).rejects.toThrow();
    });

    it("経度が存在しない場合、エラーをスローする", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { lat: 35.681236 },
        }),
      });

      await expect(
        GeocodeUsecase.geocode({ address: "test" }),
      ).rejects.toThrow();
    });

    it("dataオブジェクトが存在しない場合、エラーをスローする", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      });

      await expect(
        GeocodeUsecase.geocode({ address: "test" }),
      ).rejects.toThrow();
    });

    it("負の座標も正常に処理できる", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { lat: -33.8688, lng: 151.2093 },
        }),
      });

      const result = await GeocodeUsecase.geocode({ address: "Sydney" });

      expect(result).toEqual({ lat: -33.8688, lng: 151.2093 });
    });

    it("小数点以下の精度が保たれる", async () => {
      const preciseLocation = {
        lat: 35.681236123456,
        lng: 139.767125789012,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: preciseLocation,
        }),
      });

      const result = await GeocodeUsecase.geocode({ address: "Tokyo Station" });

      expect(result.lat).toBe(35.681236123456);
      expect(result.lng).toBe(139.767125789012);
    });

    it("住所に特殊文字が含まれていても正常に処理できる", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { lat: 35.681236, lng: 139.767125 },
        }),
      });

      const result = await GeocodeUsecase.geocode({
        address: "1-1-1 丸の内、千代田区、東京都 100-0005",
      });

      expect(result).toEqual({ lat: 35.681236, lng: 139.767125 });
      expect(mockFetch).toHaveBeenCalled();
    });

    it("GeocodeParams型を正しく使用する", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { lat: 35.681236, lng: 139.767125 },
        }),
      });

      const params: GeocodeParams = {
        address: "Test Address",
      };

      const result = await GeocodeUsecase.geocode(params);

      expect(result).toHaveProperty("lat");
      expect(result).toHaveProperty("lng");
    });
  });
});
