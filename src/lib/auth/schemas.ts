import * as z from "zod";

export const AuthFormSchema = z.object({
  email: z.email({ error: "Introduce un email válido." }).trim(),
  password: z
    .string()
    .min(8, { error: "La contraseña debe tener al menos 8 caracteres." })
    .trim(),
});

export type AuthFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
