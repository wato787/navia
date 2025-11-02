import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GooglePlacesAutocompletePrediction } from "@/lib/google-places";
import { SearchRoute } from "..";

type UseGeocodeAutocomplete =
  typeof import("@/pages/useGeocodeAutocomplete").useGeocodeAutocomplete;

type UseGeocodeAutocompleteReturn = {
  data: GooglePlacesAutocompletePrediction[] | null;
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
  overrides: Partial<GooglePlacesAutocompletePrediction> = {},
) =>
  ({
    placeId: "route-suggestion-1",
    description: "Sample Place",
    structuredFormatting: {
      mainText: "Sample",
      secondaryText: "Sample Place",
    },
    types: ["establishment"],
    ...overrides,
  }) satisfies GooglePlacesAutocompletePrediction;

describe("SearchRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGeocodeAutocomplete.mockReturnValue({ data: [], isLoading: false });
  });

  it("空白文字を含むクエリで検索ボタンをクリックするとトリムされた値がonSearchに渡される", async () => {
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

  it("候補をクリックするとmainText/secondaryTextがonSearchに渡され、inputに設定される", async () => {
    const suggestion = createSuggestion({
      placeId: "route-suggestion-2",
      structuredFormatting: {
        mainText: "Tokyo",
        secondaryText: "Japan",
      },
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
