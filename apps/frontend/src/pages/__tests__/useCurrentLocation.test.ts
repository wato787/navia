import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCurrentLocation } from "../useCurrentLocation";

describe("useCurrentLocation", () => {
  it("should initialize with null location", () => {
    const { result } = renderHook(() => useCurrentLocation());

    expect(result.current.currentLocation).toBeNull();
  });

  it("should update location on handleGeolocate", () => {
    const { result } = renderHook(() => useCurrentLocation());

    const mockPosition: GeolocationPosition = {
      coords: {
        latitude: 35.6812,
        longitude: 139.7671,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    act(() => {
      result.current.handleGeolocate(mockPosition);
    });

    expect(result.current.currentLocation).toEqual({
      lat: 35.6812,
      lng: 139.7671,
    });
  });

  it("should update location on multiple calls", () => {
    const { result } = renderHook(() => useCurrentLocation());

    const mockPosition1: GeolocationPosition = {
      coords: {
        latitude: 35.6812,
        longitude: 139.7671,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    act(() => {
      result.current.handleGeolocate(mockPosition1);
    });

    expect(result.current.currentLocation).toEqual({
      lat: 35.6812,
      lng: 139.7671,
    });

    const mockPosition2: GeolocationPosition = {
      coords: {
        latitude: 35.6895,
        longitude: 139.6917,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    act(() => {
      result.current.handleGeolocate(mockPosition2);
    });

    expect(result.current.currentLocation).toEqual({
      lat: 35.6895,
      lng: 139.6917,
    });
  });

  it("should log location to console", () => {
    const consoleLogSpy = vi.spyOn(console, "log");
    const { result } = renderHook(() => useCurrentLocation());

    const mockPosition: GeolocationPosition = {
      coords: {
        latitude: 35.6812,
        longitude: 139.7671,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    act(() => {
      result.current.handleGeolocate(mockPosition);
    });

    expect(consoleLogSpy).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  it("should maintain same handler reference (useCallback)", () => {
    const { result, rerender } = renderHook(() => useCurrentLocation());

    const firstHandler = result.current.handleGeolocate;

    rerender();

    const secondHandler = result.current.handleGeolocate;

    expect(firstHandler).toBe(secondHandler);
  });

  it("should handle negative coordinates", () => {
    const { result } = renderHook(() => useCurrentLocation());

    const mockPosition: GeolocationPosition = {
      coords: {
        latitude: -33.8688,
        longitude: 151.2093,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    act(() => {
      result.current.handleGeolocate(mockPosition);
    });

    expect(result.current.currentLocation).toEqual({
      lat: -33.8688,
      lng: 151.2093,
    });
  });

  it("should handle zero coordinates", () => {
    const { result } = renderHook(() => useCurrentLocation());

    const mockPosition: GeolocationPosition = {
      coords: {
        latitude: 0,
        longitude: 0,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    act(() => {
      result.current.handleGeolocate(mockPosition);
    });

    expect(result.current.currentLocation).toEqual({
      lat: 0,
      lng: 0,
    });
  });
});
