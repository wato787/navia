import { zValidator } from "@hono/zod-validator";
import type { z } from "zod";

export const validateJson = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
    c.req.valid("json");
  });

export const validateQuery = <TSchema extends z.ZodRawShape>(schema: z.ZodObject<TSchema>) =>
  zValidator("query", schema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
    c.req.valid("query");
  });

export const validateParams = <TSchema extends z.ZodRawShape>(schema: z.ZodObject<TSchema>) =>
  zValidator("param", schema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
    c.req.valid("param");
  });
