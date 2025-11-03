import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRouteDisplay } from "../useRouteDisplay";
import type { MapRef } from "react-map-gl/mapbox";

vi.mock("@/lib/mapbox", () => ({
  calculateBounds: vi.fn(() => [
    [139.7, 35.6],
    [139.8, 35.7],
  ]),
}));

describe("useRouteDisplay", () => {
  let mockMap: {
    getSource: ReturnType<typeof vi.fn>;
    getLayer: ReturnType<typeof vi.fn>;
    removeLayer: ReturnType<typeof vi.fn>;
    removeSource: ReturnType<typeof vi.fn>;
    addSource: ReturnType<typeof vi.fn>;
    addLayer: ReturnType<typeof vi.fn>;
    fitBounds: ReturnType<typeof vi.fn>;
  };
  let mockMapRef: React.RefObject<MapRef | null>;

  beforeEach(() => {
    mockMap = {
      getSource: vi.fn(),
      getLayer: vi.fn(),
      removeLayer: vi.fn(),
      removeSource: vi.fn(),
      addSource: vi.fn(),
      addLayer: vi.fn(),
      fitBounds: vi.fn(),
    };

    mockMapRef = {
      current: {
        getMap: vi.fn(() => mockMap),
      } as unknown as MapRef,
    };
  });

  it("should return displayRoute function", () => {
    const { result } = renderHook(() => useRouteDisplay(mockMapRef));

    expect(result.current.displayRoute).toBeDefined();
    expect(typeof result.current.displayRoute).toBe("function");
  });

  it("should do nothing when mapRef is null", async () => {
    const nullMapRef: React.RefObject<MapRef | null> = { current: null };
    const { result } = renderHook(() => useRouteDisplay(nullMapRef));

    const routeGeoJson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [139.7671, 35.6812],
              [139.6917, 35.6895],
            ],
          },
        },
      ],
    };

    await result.current.displayRoute(routeGeoJson);

    expect(mockMap.addSource).not.toHaveBeenCalled();
  });

  it("should remove existing route and add new one", async () => {
    mockMap.getSource.mockReturnValue(true);
    mockMap.getLayer.mockReturnValue(true);

    const { result } = renderHook(() => useRouteDisplay(mockMapRef));

    const routeGeoJson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [139.7671, 35.6812],
              [139.6917, 35.6895],
            ],
          },
        },
      ],
    };

    await result.current.displayRoute(routeGeoJson);

    expect(mockMap.removeLayer).toHaveBeenCalledWith("route");
    expect(mockMap.removeSource).toHaveBeenCalledWith("route");
    expect(mockMap.addSource).toHaveBeenCalledWith("route", {
      type: "geojson",
      data: routeGeoJson,
    });
    expect(mockMap.addLayer).toHaveBeenCalled();
    expect(mockMap.fitBounds).toHaveBeenCalled();
  });

  it("should skip removal when no existing source", async () => {
    mockMap.getSource.mockReturnValue(null);

    const { result } = renderHook(() => useRouteDisplay(mockMapRef));

    const routeGeoJson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [139.7671, 35.6812],
              [139.6917, 35.6895],
            ],
          },
        },
      ],
    };

    await result.current.displayRoute(routeGeoJson);

    expect(mockMap.removeLayer).not.toHaveBeenCalled();
    expect(mockMap.removeSource).not.toHaveBeenCalled();
    expect(mockMap.addSource).toHaveBeenCalled();
  });

  it("should skip layer removal when no existing layer", async () => {
    mockMap.getSource.mockReturnValue(true);
    mockMap.getLayer.mockReturnValue(null);

    const { result } = renderHook(() => useRouteDisplay(mockMapRef));

    const routeGeoJson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [139.7671, 35.6812],
              [139.6917, 35.6895],
            ],
          },
        },
      ],
    };

    await result.current.displayRoute(routeGeoJson);

    expect(mockMap.removeLayer).not.toHaveBeenCalled();
    expect(mockMap.removeSource).toHaveBeenCalledWith("route");
  });

  it("should call fitBounds with correct padding", async () => {
    const { result } = renderHook(() => useRouteDisplay(mockMapRef));

    const routeGeoJson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [139.7671, 35.6812],
              [139.6917, 35.6895],
            ],
          },
        },
      ],
    };

    await result.current.displayRoute(routeGeoJson);

    expect(mockMap.fitBounds).toHaveBeenCalledWith(
      [
        [139.7, 35.6],
        [139.8, 35.7],
      ],
      {
        padding: expect.any(Object),
      },
    );
  });

  it("should maintain same function reference (useCallback)", () => {
    const { result, rerender } = renderHook(() => useRouteDisplay(mockMapRef));

    const firstDisplayRoute = result.current.displayRoute;

    rerender();

    const secondDisplayRoute = result.current.displayRoute;

    expect(firstDisplayRoute).toBe(secondDisplayRoute);
  });

  it("should handle routes with multiple coordinates", async () => {
    const { result } = renderHook(() => useRouteDisplay(mockMapRef));

    const routeGeoJson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [139.7671, 35.6812],
              [139.7500, 35.6850],
              [139.7300, 35.6900],
              [139.6917, 35.6895],
            ],
          },
        },
      ],
    };

    await result.current.displayRoute(routeGeoJson);

    expect(mockMap.addSource).toHaveBeenCalledWith("route", {
      type: "geojson",
      data: routeGeoJson,
    });
    expect(mockMap.fitBounds).toHaveBeenCalled();
  });
});
