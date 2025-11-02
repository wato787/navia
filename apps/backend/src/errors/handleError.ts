import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { STATUS_TEXT } from "hono/utils/http-status";
import { ZodError } from "zod";

import { isProduction } from "../config/env";
import { logger } from "../lib/logger";
import type { AppBindings } from "../types/app";
import { ApiError } from "./apiError";

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
    stack?: string;
  };
};

const STATUS_CODE_MAP: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  405: "METHOD_NOT_ALLOWED",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_SERVER_ERROR",
  503: "SERVICE_UNAVAILABLE",
};

const getDefaultMessage = (status: number) => STATUS_TEXT[status] ?? "Error";

export const handleError = (err: unknown, c: Context<AppBindings>): Response => {
  const requestId = c.get("requestId");

  let status = 500;
  let code = STATUS_CODE_MAP[status];
  let message = getDefaultMessage(status);
  let details: unknown;
  const stack = err instanceof Error ? err.stack : undefined;

  if (err instanceof ApiError) {
    status = err.status;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Validation failed";
    details = err.flatten();
  } else if (err instanceof HTTPException) {
    status = err.status;
    code = STATUS_CODE_MAP[status] ?? `HTTP_${status}`;
    const fallback = getDefaultMessage(status);
    message = err.message && err.message !== "HTTPException" ? err.message : fallback;
  } else if (err instanceof Error) {
    status = 500;
    code = "INTERNAL_SERVER_ERROR";
    message = err.message || getDefaultMessage(status);
  }

  const responseMessage = status >= 500 && isProduction ? getDefaultMessage(status) : message;

  const body: ErrorResponse = {
    error: {
      code,
      message: responseMessage,
      requestId,
    },
  };

  if (details && status < 500) {
    body.error.details = details;
  }

  if (!isProduction && stack) {
    body.error.stack = stack;
  }

  const logLevel = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

  logger[logLevel]("app.error", {
    requestId,
    status,
    code,
    message,
    method: c.req.method,
    path: c.req.path,
    details,
    stack,
  });

  return c.json(body, status);
};
