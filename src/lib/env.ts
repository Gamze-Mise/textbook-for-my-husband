import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),

  // Optional at boot; validate at call-sites so missing vars don't crash unrelated routes.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  /** Optional custom CDN host (e.g. `cdn.example.com`) for generated delivery URLs. */
  CLOUDINARY_SECURE_DISTRIBUTION: z.string().optional(),
});

export const env = envSchema.parse(process.env);

