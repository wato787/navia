import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SearchBar } from "..";

describe("SearchBar", () => {
  it("handles user typing, search execution, and clearing", async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();
    const handleChange = vi.fn<(value: string) => void>();

    const RAW_QUERY = "  Tokyo ";
    const TRIMMED_QUERY = RAW_QUERY.trim();

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
    const searchButton = screen.getByRole("button");
    const searchLabel = searchButton.getAttribute("aria-label");

    expect(searchLabel).toBeTruthy();
    expect(searchButton).toHaveAccessibleName(searchLabel ?? "");
    expect(searchButton).toBeDisabled();
    expect(screen.queryAllByRole("button")).toHaveLength(1);

    await user.type(input, RAW_QUERY);

    expect(handleChange).toHaveBeenLastCalledWith(RAW_QUERY);
    expect(searchButton).toBeEnabled();

    const buttonsAfterInput = screen.getAllByRole("button");
    expect(buttonsAfterInput).toHaveLength(2);

    const clearButton = buttonsAfterInput.find((button) => button !== searchButton);
    expect(clearButton).toBeDefined();

    const clearLabel = clearButton?.getAttribute("aria-label");
    expect(clearLabel).toBeTruthy();
    expect(clearButton).not.toBeDisabled();
    expect(clearButton).toHaveAccessibleName(clearLabel ?? "");

    await user.click(searchButton);

    expect(handleSearch).toHaveBeenCalledOnce();
    expect(handleSearch).toHaveBeenCalledWith(TRIMMED_QUERY);

    await user.click(clearButton!);

    expect(handleChange).toHaveBeenLastCalledWith("");
    expect(searchButton).toBeDisabled();
    expect(input).toHaveValue("");
  });
});
