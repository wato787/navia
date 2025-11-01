/// <reference types="vite/client" />
/// <reference lib="es2021.promise" />

declare class AggregateError<T = unknown> extends Error {
  constructor(errors: Iterable<T>, message?: string, options?: { cause?: unknown });
  readonly errors: ReadonlyArray<T>;
}
