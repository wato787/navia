type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const CURRENT_LEVEL: LogLevel = (Bun.env.LOG_LEVEL as LogLevel) ?? "info";

const shouldLog = (level: LogLevel) => LEVELS[level] >= LEVELS[CURRENT_LEVEL];

const base = (level: LogLevel, message: string, payload?: Record<string, unknown>) => {
  if (!shouldLog(level)) return;

  const timestamp = new Date().toISOString();
  const entry = {
    level,
    message,
    timestamp,
    ...payload,
  } satisfies Record<string, unknown>;

  // eslint-disable-next-line no-console
  console[level === "debug" ? "log" : level](JSON.stringify(entry));
};

export const logger = {
  debug: (message: string, payload?: Record<string, unknown>) => base("debug", message, payload),
  info: (message: string, payload?: Record<string, unknown>) => base("info", message, payload),
  warn: (message: string, payload?: Record<string, unknown>) => base("warn", message, payload),
  error: (message: string, payload?: Record<string, unknown>) => base("error", message, payload),
};
