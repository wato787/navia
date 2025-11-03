import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DirectionsUsecase,
  type RouteData,
} from "@/usecases/DirectionsUsecase";
import { GeocodeUsecase } from "@/usecases/GeocodeUsecase";
import { useRouteSearch } from "../useRouteSearch";

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

vi.mock("../useRouteDisplay", () => ({
  useRouteDisplay: vi.fn(() => ({
    displayRoute: vi.fn(),
  })),
}));

// MapRefのモックに必要な型定義
type MockedMap = {
  getMap: ReturnType<typeof vi.fn>;
};

describe("useRouteSearch", () => {
  let queryClient: QueryClient;
  let mockMap: MockedMap;
  let mockMapRef: { current: MapRef | null };
  let alertMock: ReturnType<typeof vi.fn>;

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
      current: mockMap as unknown as MapRef,
    };

    alertMock = vi.fn();
    vi.stubGlobal("alert", alertMock);

    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("idleステータスで初期化される", () => {
    const { result } = renderHook(() => useRouteSearch(mockMapRef, null), {
      wrapper,
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.isPending).toBe(false);
  });

  it("目的地を検索して経路を取得できる", async () => {
    const mockDestinationCoords = { lat: 35.6895, lng: 139.6917 };
    const mockRoute: RouteData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            distance: 1000,
            duration: 300,
          },
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

    (GeocodeUsecase.geocode as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockDestinationCoords,
    );
    (DirectionsUsecase.getRoute as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockRoute,
    );

    const currentLocation = { lat: 35.6812, lng: 139.7671 };
    const { result } = renderHook(
      () => useRouteSearch(mockMapRef, currentLocation),
      { wrapper },
    );

    result.current.mutate({ destination: "Tokyo Station" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(GeocodeUsecase.geocode).toHaveBeenCalledWith({
      address: "Tokyo Station",
    });

    expect(DirectionsUsecase.getRoute).toHaveBeenCalledWith({
      origin: currentLocation,
      destination: mockDestinationCoords,
      mode: "driving",
    });
  });

  it("currentLocationがnullの場合、初期位置を使用する", async () => {
    const mockDestinationCoords = { lat: 35.6895, lng: 139.6917 };
    const mockRoute: RouteData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            distance: 1000,
            duration: 300,
          },
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

    (GeocodeUsecase.geocode as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockDestinationCoords,
    );
    (DirectionsUsecase.getRoute as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockRoute,
    );

    const { result } = renderHook(() => useRouteSearch(mockMapRef, null), {
      wrapper,
    });

    result.current.mutate({ destination: "Shinjuku" });

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

  it("エラー時にアラートを表示する", async () => {
    (GeocodeUsecase.geocode as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Address not found"),
    );

    const { result } = renderHook(() => useRouteSearch(mockMapRef, null), {
      wrapper,
    });

    result.current.mutate({ destination: "Invalid" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(alertMock).toHaveBeenCalledWith("Address not found");
  });

  it("エラーメッセージが提供されていない場合、デフォルトのエラーメッセージを表示する", async () => {
    (GeocodeUsecase.geocode as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error(),
    );

    const { result } = renderHook(() => useRouteSearch(mockMapRef, null), {
      wrapper,
    });

    result.current.mutate({ destination: "Dest" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(alertMock).toHaveBeenCalled();
  });

  it("連続した複数の検索を処理できる", async () => {
    const mockDestinationCoords1 = { lat: 35.6895, lng: 139.6917 };
    const mockDestinationCoords2 = { lat: 35.6812, lng: 139.7671 };
    const mockRoute: RouteData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            distance: 1000,
            duration: 300,
          },
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

    (GeocodeUsecase.geocode as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockDestinationCoords1)
      .mockResolvedValueOnce(mockDestinationCoords2);
    (DirectionsUsecase.getRoute as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockRoute,
    );

    const currentLocation = { lat: 35.6812, lng: 139.7671 };
    const { result } = renderHook(
      () => useRouteSearch(mockMapRef, currentLocation),
      { wrapper },
    );

    result.current.mutate({ destination: "Shibuya" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    result.current.mutate({ destination: "Ikebukuro" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(GeocodeUsecase.geocode).toHaveBeenCalledTimes(2);
    expect(DirectionsUsecase.getRoute).toHaveBeenCalledTimes(2);
  });

  it("ローディング状態を正しく管理する", async () => {
    const mockDestinationCoords = { lat: 35.6895, lng: 139.6917 };
    const mockRoute: RouteData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            distance: 1000,
            duration: 300,
          },
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

    // Promiseを遅延させて、isPending状態を確認できるようにする
    (GeocodeUsecase.geocode as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockDestinationCoords), 100);
        }),
    );
    (DirectionsUsecase.getRoute as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockRoute), 100);
        }),
    );

    const currentLocation = { lat: 35.6812, lng: 139.7671 };
    const { result } = renderHook(
      () => useRouteSearch(mockMapRef, currentLocation),
      { wrapper },
    );

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate({ destination: "Destination" });
    });

    // mutate呼び出し後、isPendingがtrueになることを確認
    await waitFor(
      () => {
        expect(result.current.isPending).toBe(true);
      },
      { timeout: 1000 },
    );

    // その後、isSuccessになることを確認
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
  });
});
