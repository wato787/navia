import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  it("?????????", () => {
    const { result } = renderHook(() => useDebounce("???", 500));

    expect(result.current).toBe("???");
  });

  it("?????????????", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "???", delay: 500 },
      },
    );

    expect(result.current).toBe("???");

    // ????
    rerender({ value: "????", delay: 500 });

    // ??????????
    expect(result.current).toBe("???");

    // ???????????
    await waitFor(
      () => {
        expect(result.current).toBe("????");
      },
      { timeout: 600 },
    );
  });

  it("???????????????????", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "?1", delay: 500 },
      },
    );

    // ?????????
    rerender({ value: "?2", delay: 500 });
    rerender({ value: "?3", delay: 500 });
    rerender({ value: "???", delay: 500 });

    // ??????????
    expect(result.current).toBe("?1");

    // ????????????????
    await waitFor(
      () => {
        expect(result.current).toBe("???");
      },
      { timeout: 600 },
    );
  });

  it("?????????debounce??", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 0, delay: 300 },
      },
    );

    expect(result.current).toBe(0);

    rerender({ value: 42, delay: 300 });

    await waitFor(
      () => {
        expect(result.current).toBe(42);
      },
      { timeout: 400 },
    );
  });

  it("?????????????debounce??", async () => {
    const obj1 = { name: "??", age: 20 };
    const obj2 = { name: "??", age: 25 };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: obj1, delay: 300 },
      },
    );

    expect(result.current).toBe(obj1);

    rerender({ value: obj2, delay: 300 });

    await waitFor(
      () => {
        expect(result.current).toBe(obj2);
      },
      { timeout: 400 },
    );
  });

  it("????????????????????", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "???", delay: 500 },
      },
    );

    rerender({ value: "????", delay: 200 });

    // ????????????
    await waitFor(
      () => {
        expect(result.current).toBe("????");
      },
      { timeout: 300 },
    );
  });

  it("???????????????????????", () => {
    vi.useFakeTimers();

    const { unmount } = renderHook(() => useDebounce("?", 500));

    unmount();

    // ??????????????
    vi.runAllTimers();

    vi.useRealTimers();
  });
});
