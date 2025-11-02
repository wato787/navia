import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MapboxGeocodeFeature } from "@/lib/mapbox";
import { SuggestionsList } from "..";

type UseGeocodeAutocomplete =
  typeof import("@/pages/useGeocodeAutocomplete").useGeocodeAutocomplete;

type UseGeocodeAutocompleteReturn = {
  data: MapboxGeocodeFeature[] | null;
  isLoading: boolean;
};

const mockUseGeocodeAutocomplete = vi.hoisted(() => {
  const fn = vi.fn() as unknown as UseGeocodeAutocomplete & {
    mockReturnValue: (value: UseGeocodeAutocompleteReturn) => void;
  };
  return fn;
});

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
    mockUseGeocodeAutocomplete.mockReturnValue({
      data: null,
      isLoading: false,
    });
  });

  it("空白文字のみのクエリでは何も表示されない", () => {
    const { container } = render(
      <SuggestionsList query="   " onSuggestionClick={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("現在地が渡されたときにproximityが正しく渡される", () => {
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

  it("ローディング中は「検索中...」が表示される", () => {
    mockUseGeocodeAutocomplete.mockReturnValue({ data: null, isLoading: true });

    renderComponent({ query: "Tokyo" });

    expect(screen.getByText(/\u691c\u7d22\u4e2d/)).toBeInTheDocument();
  });

  it("候補をクリックするとonSuggestionClickが呼ばれる", async () => {
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

  it("候補がない場合は「候補が見つかりませんでした」が表示される", () => {
    mockUseGeocodeAutocomplete.mockReturnValue({ data: [], isLoading: false });

    renderComponent({ query: "Tokyo" });

    expect(
      screen.getByText(
        /\u5019\u88dc\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f/,
      ),
    ).toBeInTheDocument();
  });

  it("Enterキーで候補を選択できる", async () => {
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
