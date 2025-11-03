import { renderHook } from "@testing-library/react";
import type { MapRef } from "react-map-gl/mapbox";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRouteDisplay } from "../useRouteDisplay";

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
  let mockMapRef: { current: MapRef | null };

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

  it("displayRoute関数を返す", () => {
    const { result } = renderHook(() => useRouteDisplay(mockMapRef));

    expect(result.current.displayRoute).toBeDefined();
    expect(typeof result.current.displayRoute).toBe("function");
  });

  it("mapRefがnullの場合、何も実行しない", async () => {
    const nullMapRef: { current: MapRef | null } = { current: null };
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

  it("既存の経路を削除して新しい経路を追加する", async () => {
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

  it("既存のソースがない場合、削除をスキップする", async () => {
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

  it("既存のレイヤーがない場合、レイヤー削除をスキップする", async () => {
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

  it("正しいパディングでfitBoundsを呼び出す", async () => {
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

  it("同じ関数参照を維持する（useCallback）", () => {
    const { result, rerender } = renderHook(() => useRouteDisplay(mockMapRef));

    const firstDisplayRoute = result.current.displayRoute;

    rerender();

    const secondDisplayRoute = result.current.displayRoute;

    expect(firstDisplayRoute).toBe(secondDisplayRoute);
  });

  it("複数の座標を持つ経路を処理できる", async () => {
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
              [139.75, 35.685],
              [139.73, 35.69],
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
