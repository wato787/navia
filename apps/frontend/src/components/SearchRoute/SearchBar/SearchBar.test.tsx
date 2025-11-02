import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("handles user typing, search execution, and clearing", async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();
    const handleChange = vi.fn<(value: string) => void>();

    const SEARCH_LABEL = "\u691c\u7d22";
    const CLEAR_LABEL = "\u5165\u529b\u3092\u30af\u30ea\u30a2";
    const RAW_QUERY = "  \u6771\u4eac ";
    const TRIMMED_QUERY = "\u6771\u4eac";

    function ControlledSearchBar() {
      const [query, setQuery] = useState("");

      const onChange = (nextValue: string) => {
        handleChange(nextValue);
        setQuery(nextValue);
      };

      return (
        <SearchBar value={query} onChange={onChange} onSearch={handleSearch} />
      );
    }

    render(<ControlledSearchBar />);

    const input = screen.getByRole("textbox");
    const searchButton = screen.getByRole("button", { name: SEARCH_LABEL });

    expect(searchButton).toBeDisabled();
    expect(screen.queryByRole("button", { name: CLEAR_LABEL })).toBeNull();

    await user.type(input, RAW_QUERY);

    expect(handleChange).toHaveBeenLastCalledWith(RAW_QUERY);
    expect(searchButton).toBeEnabled();
    expect(screen.getByRole("button", { name: CLEAR_LABEL })).toBeInTheDocument();

    await user.click(searchButton);

    expect(handleSearch).toHaveBeenCalledOnce();
    expect(handleSearch).toHaveBeenCalledWith(TRIMMED_QUERY);

    await user.click(screen.getByRole("button", { name: CLEAR_LABEL }));

    expect(handleChange).toHaveBeenLastCalledWith("");
    expect(searchButton).toBeDisabled();
    expect(input).toHaveValue("");
  });
});
