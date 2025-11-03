import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useRouteSearch } from "../useRouteSearch";
import type { MapRef } from "react-map-gl/mapbox";
import { GeocodeUsecase } from "@/usecases/GeocodeUsecase";
import { DirectionsUsecase } from "@/usecases/DirectionsUsecase";

// Usecase????
vi.mock("@/usecases/GeocodeUsecase", () => ({
  GeocodeUsecase: {
    geocode: vi.fn(),
  },
}));

vi.mock("@/usecases/DirectionsUsecase", () => ({
  DirectionsUsecase: {
    getRoute: vi.fn(),
  },
}));

// useRouteDisplay????
vi.mock("../useRouteDisplay", () => ({
  useRouteDisplay: vi.fn(() => ({
    displayRoute: vi.fn(),
  })),
}));

describe("useRouteSearch", () => {
  let queryClient: QueryClient;
  let mockMap: any;
  let mockMapRef: React.RefObject<MapRef | null>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    mockMap = {
      getMap: vi.fn(),
    };

    mockMapRef = {
      current: mockMap as any,
    };

    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("?????idle????????", () => {
    const { result } = renderHook(
      () => useRouteSearch(mockMapRef, null),
      { wrapper },
    );

    expect(result.current.status).toBe("idle");
    expect(result.current.isPending).toBe(false);
  });

  it("mutateAsync????????????????", async () => {
    const mockDestinationCoords = { lat: 35.6895, lng: 139.6917 };
    const mockRoute: GeoJSON.FeatureCollection = {
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

    vi.mocked(GeocodeUsecase.geocode).mockResolvedValue(mockDestinationCoords);
    vi.mocked(DirectionsUsecase.getRoute).mockResolvedValue(mockRoute);

    const currentLocation = { lat: 35.6812, lng: 139.7671 };
    const { result } = renderHook(
      () => useRouteSearch(mockMapRef, currentLocation),
      { wrapper },
    );

    result.current.mutate({ destination: "???", currentLocation });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(GeocodeUsecase.geocode).toHaveBeenCalledWith({
      address: "???",
    });

    expect(DirectionsUsecase.getRoute).toHaveBeenCalledWith({
      origin: currentLocation,
      destination: mockDestinationCoords,
      mode: "driving",
    });
  });

  it("????null?????????????", async () => {
    const mockDestinationCoords = { lat: 35.6895, lng: 139.6917 };
    const mockRoute: GeoJSON.FeatureCollection = {
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

    vi.mocked(GeocodeUsecase.geocode).mockResolvedValue(mockDestinationCoords);
    vi.mocked(DirectionsUsecase.getRoute).mockResolvedValue(mockRoute);

    const { result } = renderHook(
      () => useRouteSearch(mockMapRef, null),
      { wrapper },
    );

    result.current.mutate({ destination: "???", currentLocation: null });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(DirectionsUsecase.getRoute).toHaveBeenCalledWith({
      origin: expect.objectContaining({
        lat: expect.any(Number),
        lng: expect.any(Number),
      }),
      destination: mockDestinationCoords,
      mode: "driving",
    });
  });

  it("????????????????", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    vi.mocked(GeocodeUsecase.geocode).mockRejectedValue(
      new Error("??????????"),
    );

    const { result } = renderHook(
      () => useRouteSearch(mockMapRef, null),
      { wrapper },
    );

    result.current.mutate({ destination: "???????", currentLocation: null });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(alertSpy).toHaveBeenCalledWith("??????????");

    alertSpy.mockRestore();
  });

  it("?????????????????????????????", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    vi.mocked(GeocodeUsecase.geocode).mockRejectedValue(new Error());

    const { result } = renderHook(
      () => useRouteSearch(mockMapRef, null),
      { wrapper },
    );

    result.current.mutate({ destination: "???", currentLocation: null });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(alertSpy).toHaveBeenCalledWith("??????????");

    alertSpy.mockRestore();
  });

  it("????????????????", async () => {
    const mockDestinationCoords1 = { lat: 35.6895, lng: 139.6917 };
    const mockDestinationCoords2 = { lat: 35.6812, lng: 139.7671 };
    const mockRoute: GeoJSON.FeatureCollection = {
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

    vi.mocked(GeocodeUsecase.geocode)
      .mockResolvedValueOnce(mockDestinationCoords1)
      .mockResolvedValueOnce(mockDestinationCoords2);
    vi.mocked(DirectionsUsecase.getRoute).mockResolvedValue(mockRoute);

    const currentLocation = { lat: 35.6812, lng: 139.7671 };
    const { result } = renderHook(
      () => useRouteSearch(mockMapRef, currentLocation),
      { wrapper },
    );

    // 1?????
    result.current.mutate({ destination: "???", currentLocation });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // 2?????
    result.current.mutate({ destination: "???", currentLocation });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(GeocodeUsecase.geocode).toHaveBeenCalledTimes(2);
    expect(DirectionsUsecase.getRoute).toHaveBeenCalledTimes(2);
  });

  it("?????????????????", async () => {
    const mockDestinationCoords = { lat: 35.6895, lng: 139.6917 };
    const mockRoute: GeoJSON.FeatureCollection = {
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

    vi.mocked(GeocodeUsecase.geocode).mockResolvedValue(mockDestinationCoords);
    vi.mocked(DirectionsUsecase.getRoute).mockResolvedValue(mockRoute);

    const currentLocation = { lat: 35.6812, lng: 139.7671 };
    const { result } = renderHook(
      () => useRouteSearch(mockMapRef, currentLocation),
      { wrapper },
    );

    expect(result.current.isPending).toBe(false);

    result.current.mutate({ destination: "???", currentLocation });

    // ???????
    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // ???
    expect(result.current.isPending).toBe(false);
  });
});
