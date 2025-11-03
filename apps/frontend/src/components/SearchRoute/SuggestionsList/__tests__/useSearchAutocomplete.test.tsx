import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
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

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should not fetch when query is empty", () => {
    const { result } = renderHook(() => useSearchAutocomplete(""), { wrapper });

    expect(result.current.isFetching).toBe(false);
    expect(AutocompleteUsecase.fetchSuggestions).not.toHaveBeenCalled();
  });

  it("should not fetch when query is only whitespace", () => {
    const { result } = renderHook(() => useSearchAutocomplete("   "), {
      wrapper,
    });

    expect(result.current.isFetching).toBe(false);
    expect(AutocompleteUsecase.fetchSuggestions).not.toHaveBeenCalled();
  });

  it("should fetch suggestions for valid query", async () => {
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

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

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

  it("should pass proximity option correctly", async () => {
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

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

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

  it("should pass limit option correctly", async () => {
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

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

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

  it("should pass both proximity and limit options", async () => {
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

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

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

  it("should return error state on failure", async () => {
    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockRejectedValue(
      new Error("API error"),
    );

    const { result } = renderHook(() => useSearchAutocomplete("Error"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe("API error");
  });

  it("should cache results correctly", async () => {
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

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

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

  it("should handle empty results", async () => {
    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue([]);

    const { result } = renderHook(() => useSearchAutocomplete("NonExistent"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it("should manage loading state correctly", async () => {
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

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

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
