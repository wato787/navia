import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  it("初期値を即座に返す", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));

    expect(result.current).toBe("initial");
  });

  it("遅延後に新しい値を返す", async () => {
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

  it("複数の迅速な変更をデバウンスする", async () => {
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

  it("数値を処理できる", async () => {
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

  it("オブジェクト値を処理できる", async () => {
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

  it("遅延時間の変更を処理できる", async () => {
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

  it("アンマウント時にタイマーをクリーンアップする", () => {
    vi.useFakeTimers();

    const { unmount } = renderHook(() => useDebounce("value", 500));

    unmount();

    vi.runAllTimers();

    vi.useRealTimers();
  });
});
