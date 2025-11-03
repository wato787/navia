import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));

    expect(result.current).toBe("initial");
  });

  it("should return new value after delay", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      },
    );

    expect(result.current).toBe("initial");

    rerender({ value: "updated", delay: 500 });

    expect(result.current).toBe("initial");

    await waitFor(
      () => {
        expect(result.current).toBe("updated");
      },
      { timeout: 600 },
    );
  });

  it("should debounce multiple rapid changes", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "value1", delay: 500 },
      },
    );

    rerender({ value: "value2", delay: 500 });
    rerender({ value: "value3", delay: 500 });
    rerender({ value: "final", delay: 500 });

    expect(result.current).toBe("value1");

    await waitFor(
      () => {
        expect(result.current).toBe("final");
      },
      { timeout: 600 },
    );
  });

  it("should handle number values", async () => {
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

  it("should handle object values", async () => {
    const obj1 = { name: "John", age: 20 };
    const obj2 = { name: "Jane", age: 25 };

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

  it("should handle delay changes", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      },
    );

    rerender({ value: "updated", delay: 200 });

    await waitFor(
      () => {
        expect(result.current).toBe("updated");
      },
      { timeout: 300 },
    );
  });

  it("should cleanup timer on unmount", () => {
    vi.useFakeTimers();

    const { unmount } = renderHook(() => useDebounce("value", 500));

    unmount();

    vi.runAllTimers();

    vi.useRealTimers();
  });
});
