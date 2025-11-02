import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SuggestionsList } from "..";
import type { MapboxGeocodeFeature } from "@/lib/mapbox";
import type { ComponentProps } from "react";

type UseGeocodeAutocomplete = typeof import("@/pages/useGeocodeAutocomplete").useGeocodeAutocomplete;

const mockUseGeocodeAutocomplete = vi.hoisted(() =>
  vi.fn<ReturnType<UseGeocodeAutocomplete>, Parameters<UseGeocodeAutocomplete>>(),
);

vi.mock("@/pages/useGeocodeAutocomplete", () => ({
  useGeocodeAutocomplete: mockUseGeocodeAutocomplete,
}));

const createSuggestion = (
  overrides: Partial<MapboxGeocodeFeature> = {},
): MapboxGeocodeFeature => ({
  id: "suggestion-1",
  type: "Feature",
  place_type: ["place"],
  relevance: 1,
  properties: {},
  text: "Default Text",
  place_name: "Default Place",
  center: [139.6917, 35.6895],
  geometry: {
    type: "Point",
    coordinates: [139.6917, 35.6895],
  },
  ...overrides,
});

describe("SuggestionsList", () => {
  const renderComponent = (
    props: Partial<ComponentProps<typeof SuggestionsList>> = {},
  ) => {
    const onSuggestionClick = vi.fn();
    render(
      <SuggestionsList
        query=""
        onSuggestionClick={onSuggestionClick}
        {...props}
      />,
    );
    return { onSuggestionClick };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGeocodeAutocomplete.mockReturnValue({ data: null, isLoading: false });
  });

  it("renders nothing when query is blank", () => {
    const { container } = render(
      <SuggestionsList query="   " onSuggestionClick={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("passes query and location to the autocomplete hook", () => {
    const location = { lat: 35.0, lng: 139.0 };

    renderComponent({ query: "Tokyo", currentLocation: location });

    expect(mockUseGeocodeAutocomplete).toHaveBeenCalledWith(
      "Tokyo",
      expect.objectContaining({
        limit: 5,
        proximity: location,
      }),
    );
  });

  it("shows loader while fetching suggestions", () => {
    mockUseGeocodeAutocomplete.mockReturnValue({ data: null, isLoading: true });

    renderComponent({ query: "Tokyo" });

    expect(screen.getByText(/\u691c\u7d22\u4e2d/)).toBeInTheDocument();
  });

  it("renders suggestions and handles click selection", async () => {
    const suggestion = createSuggestion({
      id: "suggestion-2",
      text: "Tokyo",
      place_name: "Tokyo, Japan",
    });

    mockUseGeocodeAutocomplete.mockReturnValue({
      data: [suggestion],
      isLoading: false,
    });

    const { onSuggestionClick } = renderComponent({ query: "Tokyo" });
    const user = userEvent.setup();

    const option = await screen.findByText("Tokyo");
    await user.click(option);

    expect(onSuggestionClick).toHaveBeenCalledWith(suggestion);
  });

  it("renders empty state message when no suggestions are available", () => {
    mockUseGeocodeAutocomplete.mockReturnValue({ data: [], isLoading: false });

    renderComponent({ query: "Tokyo" });

    expect(
      screen.getByText(/\u5019\u88dc\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f/),
    ).toBeInTheDocument();
  });

  it("supports keyboard selection via Enter key", async () => {
    const suggestion = createSuggestion({
      id: "suggestion-3",
      text: "Shinjuku",
      place_name: "Shinjuku, Tokyo",
    });

    mockUseGeocodeAutocomplete.mockReturnValue({
      data: [suggestion],
      isLoading: false,
    });

    const { onSuggestionClick } = renderComponent({ query: "Tokyo" });
    const option = await screen.findByText("Shinjuku");
    option.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: "Enter",
        bubbles: true,
      }),
    );

    expect(onSuggestionClick).toHaveBeenCalledWith(suggestion);
    expect(onSuggestionClick).toHaveBeenCalledTimes(1);
  });
});
