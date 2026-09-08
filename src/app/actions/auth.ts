"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { AuthFormSchema, type AuthFormState } from "@/lib/auth/schemas";
import {
  createEmailVerificationToken,
  getRequestOrigin,
  sendVerificationEmail,
} from "@/lib/auth/verification";

const SIGNUP_SUCCESS_MESSAGE =
  "Si el email es válido, te hemos enviado un enlace para verificar tu cuenta. Revisa tu bandeja de entrada.";

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validatedFields = AuthFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  // Mismo mensaje se cree la cuenta o no: evita que el formulario se use
  // para comprobar qué emails están ya registrados.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    const token = await createEmailVerificationToken(user.id);
    const origin = await getRequestOrigin();
    await sendVerificationEmail(email, token, origin);
  }

  return { message: SIGNUP_SUCCESS_MESSAGE, success: true };
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validatedFields = AuthFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: "Email o contraseña incorrectos." };
  }
  if (!user.passwordHash) {
    return { message: "Esta cuenta se creó con Google. Usa el botón 'Continuar con Google'." };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { message: "Email o contraseña incorrectos." };
  }

  if (!user.emailVerified) {
    const token = await createEmailVerificationToken(user.id);
    const origin = await getRequestOrigin();
    await sendVerificationEmail(user.email, token, origin);
    return {
      message: "Todavía no has verificado tu email. Te hemos reenviado el enlace de verificación.",
    };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/");
}
