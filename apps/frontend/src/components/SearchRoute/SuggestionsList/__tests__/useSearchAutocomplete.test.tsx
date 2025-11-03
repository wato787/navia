import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AutocompleteSuggestion } from "@/usecases/AutocompleteUsecase";
import { AutocompleteUsecase } from "@/usecases/AutocompleteUsecase";
import { useSearchAutocomplete } from "../useSearchAutocomplete";

vi.mock("@/usecases/AutocompleteUsecase", () => ({
  AutocompleteUsecase: {
    fetchSuggestions: vi.fn(),
  },
}));

vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: vi.fn((value: unknown) => value),
}));

describe("useSearchAutocomplete", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => ReactElement;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.clearAllMocks();
  });

  it("クエリが空の場合、フェッチしない", () => {
    const { result } = renderHook(() => useSearchAutocomplete(""), { wrapper });

    expect(result.current.isFetching).toBe(false);
    expect(AutocompleteUsecase.fetchSuggestions).not.toHaveBeenCalled();
  });

  it("クエリが空白のみの場合、フェッチしない", () => {
    const { result } = renderHook(() => useSearchAutocomplete("   "), {
      wrapper,
    });

    expect(result.current.isFetching).toBe(false);
    expect(AutocompleteUsecase.fetchSuggestions).not.toHaveBeenCalled();
  });

  it("有効なクエリで候補を取得できる", async () => {
    const mockSuggestions: AutocompleteSuggestion[] = [
      {
        placeId: "1",
        description: "Tokyo Station",
        structuredFormatting: {
          mainText: "Tokyo Station",
          secondaryText: "Tokyo",
        },
        types: ["station"],
        location: { latitude: 35.6812, longitude: 139.7671 },
      },
      {
        placeId: "2",
        description: "Tokyo Tower",
        structuredFormatting: {
          mainText: "Tokyo Tower",
          secondaryText: "Tokyo",
        },
        types: ["landmark"],
        location: { latitude: 35.6586, longitude: 139.7454 },
      },
    ];

    (
      AutocompleteUsecase.fetchSuggestions as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockSuggestions);

    const { result } = renderHook(() => useSearchAutocomplete("Tokyo"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledWith({
      query: "Tokyo",
      proximity: undefined,
      limit: undefined,
    });

    expect(result.current.data).toEqual(mockSuggestions);
  });

  it("proximityオプションを正しく渡せる", async () => {
    const mockSuggestions: AutocompleteSuggestion[] = [
      {
        placeId: "1",
        description: "Shibuya Station",
        structuredFormatting: {
          mainText: "Shibuya Station",
          secondaryText: "Tokyo",
        },
        types: ["station"],
        location: { latitude: 35.658, longitude: 139.7016 },
      },
    ];

    (
      AutocompleteUsecase.fetchSuggestions as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockSuggestions);

    const proximity = { lat: 35.6812, lng: 139.7671 };

    const { result } = renderHook(
      () => useSearchAutocomplete("Station", { proximity }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledWith({
      query: "Station",
      proximity,
      limit: undefined,
    });
  });

  it("limitオプションを正しく渡せる", async () => {
    const mockSuggestions: AutocompleteSuggestion[] = [
      {
        placeId: "1",
        description: "Shinjuku Station",
        structuredFormatting: {
          mainText: "Shinjuku Station",
          secondaryText: "Tokyo",
        },
        types: ["station"],
        location: { latitude: 35.6896, longitude: 139.7006 },
      },
    ];

    (
      AutocompleteUsecase.fetchSuggestions as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockSuggestions);

    const { result } = renderHook(
      () => useSearchAutocomplete("Shinjuku", { limit: 5 }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledWith({
      query: "Shinjuku",
      proximity: undefined,
      limit: 5,
    });
  });

  it("proximityとlimitの両方のオプションを渡せる", async () => {
    const mockSuggestions: AutocompleteSuggestion[] = [
      {
        placeId: "1",
        description: "Ikebukuro Station",
        structuredFormatting: {
          mainText: "Ikebukuro Station",
          secondaryText: "Tokyo",
        },
        types: ["station"],
        location: { latitude: 35.7295, longitude: 139.7109 },
      },
    ];

    (
      AutocompleteUsecase.fetchSuggestions as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockSuggestions);

    const proximity = { lat: 35.6812, lng: 139.7671 };

    const { result } = renderHook(
      () => useSearchAutocomplete("Ikebukuro", { proximity, limit: 3 }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledWith({
      query: "Ikebukuro",
      proximity,
      limit: 3,
    });
  });

  it("エラー時にエラーステートを返す", async () => {
    (
      AutocompleteUsecase.fetchSuggestions as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error("API error"));

    const { result } = renderHook(() => useSearchAutocomplete("Error"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe("API error");
  });

  it("結果を正しくキャッシュする", async () => {
    const mockSuggestions: AutocompleteSuggestion[] = [
      {
        placeId: "1",
        description: "Shinagawa Station",
        structuredFormatting: {
          mainText: "Shinagawa Station",
          secondaryText: "Tokyo",
        },
        types: ["station"],
        location: { latitude: 35.6285, longitude: 139.7387 },
      },
    ];

    (
      AutocompleteUsecase.fetchSuggestions as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockSuggestions);

    const { result: result1 } = renderHook(
      () => useSearchAutocomplete("Shinagawa"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledTimes(1);

    const { result: result2 } = renderHook(
      () => useSearchAutocomplete("Shinagawa"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true);
    });

    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledTimes(1);
    expect(result2.current.data).toEqual(mockSuggestions);
  });

  it("空の結果を処理できる", async () => {
    (
      AutocompleteUsecase.fetchSuggestions as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);

    const { result } = renderHook(() => useSearchAutocomplete("NonExistent"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it("ローディング状態を正しく管理する", async () => {
    const mockSuggestions: AutocompleteSuggestion[] = [
      {
        placeId: "1",
        description: "Ueno Station",
        structuredFormatting: {
          mainText: "Ueno Station",
          secondaryText: "Tokyo",
        },
        types: ["station"],
        location: { latitude: 35.7138, longitude: 139.7774 },
      },
    ];

    (
      AutocompleteUsecase.fetchSuggestions as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockSuggestions);

    const { result } = renderHook(() => useSearchAutocomplete("Ueno"), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isLoading).toBe(false);
  });
});
