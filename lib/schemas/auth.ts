import { z } from "zod";

export const RegisterRequestSchema = z.object({
  email: z.string().email("Geçerli bir e-posta gir."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı."),
  displayName: z.string().min(1).max(40).optional(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    displayName: z.string().nullable(),
    plan: z.enum(["free", "premium"]),
  }),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
