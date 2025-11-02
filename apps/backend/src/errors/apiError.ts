import { HTTPException } from "hono/http-exception";

type ApiErrorOptions = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  cause?: unknown;
};

export class ApiError extends HTTPException {
  readonly code: string;

  readonly details?: unknown;

  readonly cause?: unknown;

  constructor({ status, code, message, details, cause }: ApiErrorOptions) {
    super(status, { message });
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.cause = cause;
  }
}

export const createApiError = (options: ApiErrorOptions) => new ApiError(options);

export const badRequest = (message = "Bad request", details?: unknown) =>
  new ApiError({ status: 400, code: "BAD_REQUEST", message, details });

export const unauthorized = (message = "Unauthorized") =>
  new ApiError({ status: 401, code: "UNAUTHORIZED", message });

export const forbidden = (message = "Forbidden") =>
  new ApiError({ status: 403, code: "FORBIDDEN", message });

export const notFound = (message = "Not found") =>
  new ApiError({ status: 404, code: "NOT_FOUND", message });

export const conflict = (message = "Conflict", details?: unknown) =>
  new ApiError({ status: 409, code: "CONFLICT", message, details });

export const unprocessableEntity = (message = "Unprocessable entity", details?: unknown) =>
  new ApiError({ status: 422, code: "UNPROCESSABLE_ENTITY", message, details });

export const tooManyRequests = (message = "Too many requests") =>
  new ApiError({ status: 429, code: "TOO_MANY_REQUESTS", message });

export const internalServerError = (message = "Internal Server Error", details?: unknown) =>
  new ApiError({ status: 500, code: "INTERNAL_SERVER_ERROR", message, details });
