import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AutocompleteSuggestion } from "@/usecases/AutocompleteUsecase";
import { SuggestionsList } from "..";

vi.mock(
  "@/components/SearchRoute/SuggestionsList/useSearchAutocomplete",
  () => ({
    useSearchAutocomplete: vi.fn(),
  }),
);

const createSuggestion = (
  overrides: Partial<AutocompleteSuggestion> = {},
): AutocompleteSuggestion => ({
  placeId: "suggestion-1",
  description: "Default Place",
  structuredFormatting: {
    mainText: "Default Text",
    secondaryText: "Default Place",
  },
  types: ["establishment"],
  ...overrides,
});

describe("SuggestionsList", () => {
  let mockUseSearchAutocomplete: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import(
      "@/components/SearchRoute/SuggestionsList/useSearchAutocomplete"
    );
    mockUseSearchAutocomplete = module.useSearchAutocomplete as ReturnType<
      typeof vi.fn
    >;
    mockUseSearchAutocomplete.mockReturnValue({
      data: null,
      isLoading: false,
    });
  });

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

  it("空白文字のみのクエリでは何も表示されない", () => {
    const { container } = render(
      <SuggestionsList query="   " onSuggestionClick={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("現在地が渡されたときにproximityが正しく渡される", () => {
    const location = { lat: 35.0, lng: 139.0 };

    renderComponent({ query: "Tokyo", currentLocation: location });

    expect(mockUseSearchAutocomplete).toHaveBeenCalledWith(
      "Tokyo",
      expect.objectContaining({
        limit: 5,
        proximity: location,
      }),
    );
  });

  it("ローディング中は「検索中...」が表示される", () => {
    mockUseSearchAutocomplete.mockReturnValue({
      data: null,
      isLoading: true,
    });

    renderComponent({ query: "Tokyo" });

    expect(screen.getByText(/\u691c\u7d22\u4e2d/)).toBeInTheDocument();
  });

  it("候補をクリックするとonSuggestionClickが呼ばれる", async () => {
    const suggestion = createSuggestion({
      placeId: "suggestion-2",
      structuredFormatting: {
        mainText: "Tokyo",
        secondaryText: "Japan",
      },
    });

    mockUseSearchAutocomplete.mockReturnValue({
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
    mockUseSearchAutocomplete.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderComponent({ query: "Tokyo" });

    expect(
      screen.getByText(
        /\u5019\u88dc\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f/,
      ),
    ).toBeInTheDocument();
  });

  it("Enterキーで候補を選択できる", async () => {
    const suggestion = createSuggestion({
      placeId: "suggestion-3",
      structuredFormatting: {
        mainText: "Shinjuku",
        secondaryText: "Tokyo",
      },
    });

    mockUseSearchAutocomplete.mockReturnValue({
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
