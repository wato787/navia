import { useEffect, useState } from "react";

/**
 * 値をdebounceするカスタムフック
 * @param value - debounce対象の値
 * @param delay - debounceの遅延時間（ミリ秒）
 * @returns debounceされた値
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
