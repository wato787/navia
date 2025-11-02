import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8787),
  BASE_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  GOOGLE_MAPS_API_KEY: z.string().min(1, "Google Maps API key is required"),
});

const parsedEnv = EnvSchema.safeParse({
  NODE_ENV: Bun.env.NODE_ENV,
  PORT: Bun.env.PORT,
  BASE_URL: Bun.env.BASE_URL,
  LOG_LEVEL: Bun.env.LOG_LEVEL,
  GOOGLE_MAPS_API_KEY: Bun.env.GOOGLE_MAPS_API_KEY,
});

if (!parsedEnv.success) {
  console.error(
    "Failed to validate environment variables",
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables");
}

export const ENV = parsedEnv.data;

export type Env = typeof ENV;

export const isProduction = ENV.NODE_ENV === "production";
