import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCurrentLocation } from "../useCurrentLocation";

describe("useCurrentLocation", () => {
  it("nullの位置で初期化される", () => {
    const { result } = renderHook(() => useCurrentLocation());

    expect(result.current.currentLocation).toBeNull();
  });

  it("handleGeolocateで位置を更新できる", () => {
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
        toJSON: vi.fn(),
      },
      timestamp: Date.now(),
      toJSON: vi.fn(),
    };

    act(() => {
      result.current.handleGeolocate(mockPosition);
    });

    expect(result.current.currentLocation).toEqual({
      lat: 35.6812,
      lng: 139.7671,
    });
  });

  it("複数回の呼び出しで位置を更新できる", () => {
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
        toJSON: vi.fn(),
      },
      timestamp: Date.now(),
      toJSON: vi.fn(),
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
        toJSON: vi.fn(),
      },
      timestamp: Date.now(),
      toJSON: vi.fn(),
    };

    act(() => {
      result.current.handleGeolocate(mockPosition2);
    });

    expect(result.current.currentLocation).toEqual({
      lat: 35.6895,
      lng: 139.6917,
    });
  });

  it("位置をコンソールにログ出力する", () => {
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
        toJSON: vi.fn(),
      },
      timestamp: Date.now(),
      toJSON: vi.fn(),
    };

    act(() => {
      result.current.handleGeolocate(mockPosition);
    });

    expect(consoleLogSpy).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  it("同じハンドラー参照を維持する（useCallback）", () => {
    const { result, rerender } = renderHook(() => useCurrentLocation());

    const firstHandler = result.current.handleGeolocate;

    rerender();

    const secondHandler = result.current.handleGeolocate;

    expect(firstHandler).toBe(secondHandler);
  });

  it("負の座標を処理できる", () => {
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
        toJSON: vi.fn(),
      },
      timestamp: Date.now(),
      toJSON: vi.fn(),
    };

    act(() => {
      result.current.handleGeolocate(mockPosition);
    });

    expect(result.current.currentLocation).toEqual({
      lat: -33.8688,
      lng: 151.2093,
    });
  });

  it("ゼロの座標を処理できる", () => {
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
        toJSON: vi.fn(),
      },
      timestamp: Date.now(),
      toJSON: vi.fn(),
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
