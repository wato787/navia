import { beforeEach, describe, expect, it, vi } from "vitest";
import { GeocodeUsecase, type GeocodeParams } from "../GeocodeUsecase";
import type { Location } from "@/types/location";

// fetch????
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("GeocodeUsecase", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("geocode", () => {
    it("???????????????", async () => {
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
        address: "???",
      });

      expect(result).toEqual(mockLocation);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/places/geocode"),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("address="),
      );
    });

    it("??????????????????????", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { lat: 35.681236, lng: 139.767125 },
        }),
      });

      await GeocodeUsecase.geocode({
        address: "??????????",
      });

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("/api/places/geocode?");
      // URL?????????????????
      expect(decodeURIComponent(callUrl)).toContain("??????????");
    });

    it("??????????????", async () => {
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

    it("??????API????????", async () => {
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

    it("API??????????????????????", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
        json: async () => ({ error: "Invalid address" }),
      });

      await expect(
        GeocodeUsecase.geocode({ address: "invalid address" }),
      ).rejects.toThrow();
    });

    it("????????????????????", async () => {
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

    it("????????????????????", async () => {
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

    it("data????????????????????????", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      });

      await expect(
        GeocodeUsecase.geocode({ address: "test" }),
      ).rejects.toThrow();
    });

    it("?????????????", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { lat: -33.8688, lng: 151.2093 },
        }),
      });

      const result = await GeocodeUsecase.geocode({ address: "Sydney" });

      expect(result).toEqual({ lat: -33.8688, lng: 151.2093 });
    });

    it("?????????????", async () => {
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

    it("???????????????????????", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { lat: 35.681236, lng: 139.767125 },
        }),
      });

      const result = await GeocodeUsecase.geocode({
        address: "1-1-1 ???????????? 100-0005",
      });

      expect(result).toEqual({ lat: 35.681236, lng: 139.767125 });
      expect(mockFetch).toHaveBeenCalled();
    });

    it("GeocodeParams?????????", async () => {
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
