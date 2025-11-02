import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SearchRoute } from "..";
import type { MapboxGeocodeFeature } from "@/lib/mapbox";

type UseGeocodeAutocomplete = typeof import("@/pages/useGeocodeAutocomplete").useGeocodeAutocomplete;

const mockUseGeocodeAutocomplete = vi.hoisted(() =>
  vi.fn<ReturnType<UseGeocodeAutocomplete>, Parameters<UseGeocodeAutocomplete>>(),
);

vi.mock("@/pages/useGeocodeAutocomplete", () => ({
  useGeocodeAutocomplete: mockUseGeocodeAutocomplete,
}));

const createSuggestion = (overrides: Partial<MapboxGeocodeFeature> = {}) => ({
  id: "route-suggestion-1",
  type: "Feature",
  place_type: ["place"],
  relevance: 1,
  properties: {},
  text: "Sample",
  place_name: "Sample Place",
  center: [139.6917, 35.6895],
  geometry: {
    type: "Point",
    coordinates: [139.6917, 35.6895],
  },
  ...overrides,
}) satisfies MapboxGeocodeFeature;

describe("SearchRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGeocodeAutocomplete.mockReturnValue({ data: [], isLoading: false });
  });

  it("???????????????????", async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<SearchRoute onSearch={handleSearch} />);

    const input = screen.getByRole("textbox");
    const searchButton = screen.getByRole("button");

    await user.type(input, "  Tokyo ");
    await user.click(searchButton);

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith("Tokyo");

    await waitFor(() => {
      expect(mockUseGeocodeAutocomplete).toHaveBeenCalledWith(
        "  Tokyo ",
        expect.objectContaining({ limit: 5 }),
      );
    });
  });

  it("???????????????????", async () => {
    const suggestion = createSuggestion({
      id: "route-suggestion-2",
      text: "Tokyo",
      place_name: "Tokyo, Japan",
    });

    mockUseGeocodeAutocomplete.mockReturnValue({
      data: [suggestion],
      isLoading: false,
    });

    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<SearchRoute onSearch={handleSearch} />);

    const input = screen.getByRole("textbox");

    await user.type(input, "Tokyo");

    const option = await screen.findByText("Tokyo");
    await user.click(option);

    expect(handleSearch).toHaveBeenCalledWith("Tokyo, Japan");
    expect(handleSearch).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(input).toHaveValue("Tokyo, Japan"));
  });
});
