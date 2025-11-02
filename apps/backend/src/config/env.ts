import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8787),
  BASE_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const parsedEnv = EnvSchema.safeParse({
  NODE_ENV: Bun.env.NODE_ENV,
  PORT: Bun.env.PORT,
  BASE_URL: Bun.env.BASE_URL,
  LOG_LEVEL: Bun.env.LOG_LEVEL,
});

if (!parsedEnv.success) {
  console.error("??????????????", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const ENV = parsedEnv.data;

export type Env = typeof ENV;

export const isProduction = ENV.NODE_ENV === "production";
