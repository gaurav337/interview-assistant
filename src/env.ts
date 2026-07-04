import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side env vars. Never sent to the browser.
   * App will throw at startup if any of these are missing or invalid.
   */
  server: {
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
    DIRECT_URL: z.string().url("DIRECT_URL must be a valid URL"),
    AUTH_SECRET: z
      .string()
      .min(32, "AUTH_SECRET must be at least 32 characters (run: openssl rand -base64 32)"),
    AUTH_URL: z.string().url("AUTH_URL must be a valid URL").optional(),
    NVIDIA_API_KEY: z
      .string()
      .startsWith("nvapi-", "NVIDIA_API_KEY must start with 'nvapi-'"),
    UPSTASH_REDIS_REST_URL: z.string().url("UPSTASH_REDIS_REST_URL must be a valid URL"),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "UPSTASH_REDIS_REST_TOKEN is required"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Client-side env vars. Exposed to the browser. Must be prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
  },

  /**
   * Mapping of env var names to their process.env equivalents.
   * This is needed for type-safe access and build-time validation.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /**
   * Skip validation in CI (we use stub values in build-check).
   * The SKIP_ENV_VALIDATION var is set in ci.yml for the build step.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
