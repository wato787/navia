import { zValidator } from "@hono/zod-validator";
import type { z } from "zod";

export const validateJson = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  zValidator("json", schema, (result) => {
    if (!result.success) {
      throw result.error;
    }
  });

export const validateQuery = <TSchema extends z.ZodRawShape>(
  schema: z.ZodObject<TSchema>,
) =>
  zValidator("query", schema, (result) => {
    if (!result.success) {
      throw result.error;
    }
  });

export const validateParams = <TSchema extends z.ZodRawShape>(
  schema: z.ZodObject<TSchema>,
) =>
  zValidator("param", schema, (result) => {
    if (!result.success) {
      throw result.error;
    }
  });
