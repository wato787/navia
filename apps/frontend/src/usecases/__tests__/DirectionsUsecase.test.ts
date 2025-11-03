import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DirectionsUsecase,
  type RouteData,
  type TravelMode,
} from "../DirectionsUsecase";

// @mapbox/polylineのモック
vi.mock("@mapbox/polyline", () => ({
  decode: vi.fn((polyline: string) => {
    // 簡略化したポリラインデコード（テスト用）
    // 実際のポリラインは複雑なエンコーディングだが、テストでは簡単な座標を返す
    if (polyline === "mock-polyline") {
      return [
        [35.681236, 139.767125], // [lat, lng]形式
        [35.682, 139.768],
        [35.683, 139.769],
      ];
    }
    return [];
  }),
}));

// fetchのモック
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as typeof fetch;

describe("DirectionsUsecase", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("getRoute", () => {
    it("正常に経路データを取得できる", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polyline: "mock-polyline",
            distance: 1234.5,
            duration: 300,
          },
        }),
      });

      const result = await DirectionsUsecase.getRoute({
        origin: { lat: 35.681236, lng: 139.767125 },
        destination: { lat: 35.683, lng: 139.769 },
      });

      expect(result.type).toBe("FeatureCollection");
      expect(result.features).toHaveLength(1);
      expect(result.features[0].type).toBe("Feature");
      expect(result.features[0].properties).toEqual({
        distance: 1234.5,
        duration: 300,
      });
      expect(result.features[0].geometry.type).toBe("LineString");
      // デコードされた座標は[lng, lat]形式に変換される
      expect(result.features[0].geometry.coordinates).toEqual([
        [139.767125, 35.681236],
        [139.768, 35.682],
        [139.769, 35.683],
      ]);
    });

    it("移動手段を指定できる", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polyline: "mock-polyline",
            distance: 1000,
            duration: 600,
          },
        }),
      });

      const modes: TravelMode[] = [
        "driving",
        "walking",
        "bicycling",
        "transit",
      ];

      for (const mode of modes) {
        mockFetch.mockClear();
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              polyline: "mock-polyline",
              distance: 1000,
              duration: 600,
            },
          }),
        });

        await DirectionsUsecase.getRoute({
          origin: { lat: 35.681236, lng: 139.767125 },
          destination: { lat: 35.683, lng: 139.769 },
          mode,
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`mode=${mode}`),
        );
      }
    });

    it("デフォルトの移動手段はdriving", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polyline: "mock-polyline",
            distance: 1000,
            duration: 600,
          },
        }),
      });

      await DirectionsUsecase.getRoute({
        origin: { lat: 35.681236, lng: 139.767125 },
        destination: { lat: 35.683, lng: 139.769 },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("mode=driving"),
      );
    });

    it("alternativesパラメータを指定できる", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polyline: "mock-polyline",
            distance: 1000,
            duration: 600,
          },
        }),
      });

      await DirectionsUsecase.getRoute({
        origin: { lat: 35.681236, lng: 139.767125 },
        destination: { lat: 35.683, lng: 139.769 },
        alternatives: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("alternatives=true"),
      );
    });

    it("デフォルトのalternativesはfalse", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polyline: "mock-polyline",
            distance: 1000,
            duration: 600,
          },
        }),
      });

      await DirectionsUsecase.getRoute({
        origin: { lat: 35.681236, lng: 139.767125 },
        destination: { lat: 35.683, lng: 139.769 },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("alternatives=false"),
      );
    });

    it("正しいクエリパラメータを構築する", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polyline: "mock-polyline",
            distance: 1000,
            duration: 600,
          },
        }),
      });

      await DirectionsUsecase.getRoute({
        origin: { lat: 35.681236, lng: 139.767125 },
        destination: { lat: 35.683, lng: 139.769 },
      });

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("originLat=35.681236");
      expect(callUrl).toContain("originLng=139.767125");
      expect(callUrl).toContain("destLat=35.683");
      expect(callUrl).toContain("destLng=139.769");
    });

    it("APIレスポンスがエラーの場合、エラーをスローする", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
        json: async () => ({ error: "Route not found" }),
      });

      await expect(
        DirectionsUsecase.getRoute({
          origin: { lat: 35.681236, lng: 139.767125 },
          destination: { lat: 35.683, lng: 139.769 },
        }),
      ).rejects.toThrow();
    });

    it("ポリラインが存在しない場合、エラーをスローする", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polyline: null,
            distance: 1000,
            duration: 600,
          },
        }),
      });

      await expect(
        DirectionsUsecase.getRoute({
          origin: { lat: 35.681236, lng: 139.767125 },
          destination: { lat: 35.683, lng: 139.769 },
        }),
      ).rejects.toThrow();
    });

    it("dataオブジェクトが存在しない場合、エラーをスローする", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      });

      await expect(
        DirectionsUsecase.getRoute({
          origin: { lat: 35.681236, lng: 139.767125 },
          destination: { lat: 35.683, lng: 139.769 },
        }),
      ).rejects.toThrow();
    });

    it("GeoJSON形式が正しい", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polyline: "mock-polyline",
            distance: 1234.5,
            duration: 300,
          },
        }),
      });

      const result: RouteData = await DirectionsUsecase.getRoute({
        origin: { lat: 35.681236, lng: 139.767125 },
        destination: { lat: 35.683, lng: 139.769 },
      });

      // GeoJSON FeatureCollectionの構造を検証
      expect(result).toHaveProperty("type", "FeatureCollection");
      expect(result).toHaveProperty("features");
      expect(Array.isArray(result.features)).toBe(true);

      // Feature の構造を検証
      const feature = result.features[0];
      expect(feature).toHaveProperty("type", "Feature");
      expect(feature).toHaveProperty("properties");
      expect(feature).toHaveProperty("geometry");

      // Geometry の構造を検証
      expect(feature.geometry).toHaveProperty("type", "LineString");
      expect(feature.geometry).toHaveProperty("coordinates");
      expect(Array.isArray(feature.geometry.coordinates)).toBe(true);

      // 座標は [lng, lat] の配列であることを確認
      const coords = feature.geometry.coordinates[0];
      expect(coords).toHaveLength(2);
      expect(typeof coords[0]).toBe("number"); // longitude
      expect(typeof coords[1]).toBe("number"); // latitude
    });
  });
});
