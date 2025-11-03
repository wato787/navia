import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSearchAutocomplete } from "../useSearchAutocomplete";
import { AutocompleteUsecase } from "@/usecases/AutocompleteUsecase";

// AutocompleteUsecase????
vi.mock("@/usecases/AutocompleteUsecase", () => ({
  AutocompleteUsecase: {
    fetchSuggestions: vi.fn(),
  },
}));

// useDebounce????
vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: vi.fn((value) => value),
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

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("????????????????????", () => {
    const { result } = renderHook(
      () => useSearchAutocomplete(""),
      { wrapper },
    );

    expect(result.current.isFetching).toBe(false);
    expect(AutocompleteUsecase.fetchSuggestions).not.toHaveBeenCalled();
  });

  it("?????????????????????????", () => {
    const { result } = renderHook(
      () => useSearchAutocomplete("   "),
      { wrapper },
    );

    expect(result.current.isFetching).toBe(false);
    expect(AutocompleteUsecase.fetchSuggestions).not.toHaveBeenCalled();
  });

  it("????????????????????", async () => {
    const mockSuggestions = [
      {
        id: "1",
        name: "???",
        address: "??????????1??",
        location: { lat: 35.6812, lng: 139.7671 },
      },
      {
        id: "2",
        name: "?????",
        address: "????????4??2-8",
        location: { lat: 35.6586, lng: 139.7454 },
      },
    ];

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

    const { result } = renderHook(
      () => useSearchAutocomplete("??"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledWith({
      query: "??",
      proximity: undefined,
      limit: undefined,
    });

    expect(result.current.data).toEqual(mockSuggestions);
  });

  it("proximity???????????", async () => {
    const mockSuggestions = [
      {
        id: "1",
        name: "???",
        address: "??????",
        location: { lat: 35.6580, lng: 139.7016 },
      },
    ];

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

    const proximity = { lat: 35.6812, lng: 139.7671 };

    const { result } = renderHook(
      () => useSearchAutocomplete("?", { proximity }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledWith({
      query: "?",
      proximity,
      limit: undefined,
    });
  });

  it("limit???????????", async () => {
    const mockSuggestions = [
      {
        id: "1",
        name: "???",
        address: "??????",
        location: { lat: 35.6896, lng: 139.7006 },
      },
    ];

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

    const { result } = renderHook(
      () => useSearchAutocomplete("??", { limit: 5 }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledWith({
      query: "??",
      proximity: undefined,
      limit: 5,
    });
  });

  it("proximity?limit???????????????", async () => {
    const mockSuggestions = [
      {
        id: "1",
        name: "???",
        address: "??????",
        location: { lat: 35.7295, lng: 139.7109 },
      },
    ];

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

    const proximity = { lat: 35.6812, lng: 139.7671 };

    const { result } = renderHook(
      () => useSearchAutocomplete("??", { proximity, limit: 3 }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledWith({
      query: "??",
      proximity,
      limit: 3,
    });
  });

  it("????????????????", async () => {
    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockRejectedValue(
      new Error("API ???"),
    );

    const { result } = renderHook(
      () => useSearchAutocomplete("???"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe("API ???");
  });

  it("?????????????", async () => {
    const mockSuggestions = [
      {
        id: "1",
        name: "???",
        address: "???????",
        location: { lat: 35.6285, lng: 139.7387 },
      },
    ];

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

    // 1?????????
    const { result: result1 } = renderHook(
      () => useSearchAutocomplete("??"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledTimes(1);

    // 2????????????????
    const { result: result2 } = renderHook(
      () => useSearchAutocomplete("??"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true);
    });

    // ???????????????API?1???????
    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledTimes(1);
    expect(result2.current.data).toEqual(mockSuggestions);
  });

  it("????????????", async () => {
    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue([]);

    const { result } = renderHook(
      () => useSearchAutocomplete("???????"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it("?????????????????", async () => {
    const mockSuggestions = [
      {
        id: "1",
        name: "???",
        address: "??????",
        location: { lat: 35.7138, lng: 139.7774 },
      },
    ];

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

    const { result } = renderHook(
      () => useSearchAutocomplete("??"),
      { wrapper },
    );

    // ????
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // ???
    expect(result.current.isLoading).toBe(false);
  });

  it("???????????????", async () => {
    const mockSuggestions = [
      {
        id: "1",
        name: "??????",
        address: "????????",
        location: { lat: 35.7101, lng: 139.8107 },
      },
    ];

    vi.mocked(AutocompleteUsecase.fetchSuggestions).mockResolvedValue(
      mockSuggestions,
    );

    const { result } = renderHook(
      () => useSearchAutocomplete("??????"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(AutocompleteUsecase.fetchSuggestions).toHaveBeenCalledWith({
      query: "??????",
      proximity: undefined,
      limit: undefined,
    });

    expect(result.current.data).toEqual(mockSuggestions);
  });
});
