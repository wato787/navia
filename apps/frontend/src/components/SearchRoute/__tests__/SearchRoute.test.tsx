import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AutocompleteSuggestion } from "@/usecases/AutocompleteUsecase";
import { SearchRoute } from "..";

vi.mock(
  "@/components/SearchRoute/SuggestionsList/useSearchAutocomplete",
  () => ({
    useSearchAutocomplete: vi.fn(),
  }),
);

const createSuggestion = (overrides: Partial<AutocompleteSuggestion> = {}) =>
  ({
    placeId: "route-suggestion-1",
    description: "Sample Place",
    structuredFormatting: {
      mainText: "Sample",
      secondaryText: "Sample Place",
    },
    types: ["establishment"],
    ...overrides,
  }) satisfies AutocompleteSuggestion;

describe("SearchRoute", () => {
  let mockUseSearchAutocomplete: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import(
      "@/components/SearchRoute/SuggestionsList/useSearchAutocomplete"
    );
    mockUseSearchAutocomplete = module.useSearchAutocomplete as ReturnType<
      typeof vi.fn
    >;
    mockUseSearchAutocomplete.mockReturnValue({ data: [], isLoading: false });
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
      expect(mockUseSearchAutocomplete).toHaveBeenCalledWith(
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

    mockUseSearchAutocomplete.mockReturnValue({
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
