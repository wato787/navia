import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AutocompleteUsecase,
  type AutocompleteSuggestion,
} from "../AutocompleteUsecase";

// fetchのモック
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as typeof fetch;

describe("AutocompleteUsecase", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("fetchSuggestions", () => {
    it("正常にオートコンプリート候補を取得できる", async () => {
      const mockSuggestions: AutocompleteSuggestion[] = [
        {
          placeId: "place-1",
          description: "Tokyo Station, Japan",
          structuredFormatting: {
            mainText: "Tokyo Station",
            secondaryText: "Japan",
          },
          types: ["train_station", "transit_station"],
          location: {
            latitude: 35.681236,
            longitude: 139.767125,
          },
        },
        {
          placeId: "place-2",
          description: "Tokyo Tower, Japan",
          structuredFormatting: {
            mainText: "Tokyo Tower",
            secondaryText: "Japan",
          },
          types: ["tourist_attraction"],
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockSuggestions }),
      });

      const result = await AutocompleteUsecase.fetchSuggestions({
        query: "Tokyo",
      });

      expect(result).toEqual(mockSuggestions);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/places/autocomplete"),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("input=Tokyo"),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=5"),
      );
    });

    it("proximityパラメータを指定した場合、緯度経度がクエリパラメータに含まれる", async () => {
      const mockSuggestions: AutocompleteSuggestion[] = [];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockSuggestions }),
      });

      await AutocompleteUsecase.fetchSuggestions({
        query: "restaurant",
        proximity: { lat: 35.6812, lng: 139.7671 },
        limit: 10,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("latitude=35.6812"),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("longitude=139.7671"),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=10"),
      );
    });

    it("limitのデフォルト値は5", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await AutocompleteUsecase.fetchSuggestions({
        query: "test",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=5"),
      );
    });

    it("APIレスポンスがエラーの場合、エラーをスローする", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
        json: async () => ({ error: "Invalid input" }),
      });

      await expect(
        AutocompleteUsecase.fetchSuggestions({ query: "" }),
      ).rejects.toThrow();
    });

    it("レスポンスのdataが配列でない場合、エラーをスローする", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      });

      await expect(
        AutocompleteUsecase.fetchSuggestions({ query: "test" }),
      ).rejects.toThrow();
    });

    it("locationがオプショナルなsuggestionsも正常に処理できる", async () => {
      const mockSuggestions: AutocompleteSuggestion[] = [
        {
          placeId: "place-1",
          description: "Sample Place",
          structuredFormatting: {
            mainText: "Sample",
            secondaryText: "Place",
          },
          types: ["establishment"],
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockSuggestions }),
      });

      const result = await AutocompleteUsecase.fetchSuggestions({
        query: "sample",
      });

      expect(result).toEqual(mockSuggestions);
      expect(result[0].location).toBeUndefined();
    });

    it("空のクエリでも適切にAPIリクエストを行う", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const result = await AutocompleteUsecase.fetchSuggestions({
        query: "",
      });

      expect(result).toEqual([]);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("input="));
    });
  });
});
