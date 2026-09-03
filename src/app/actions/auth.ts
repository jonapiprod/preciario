"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { AuthFormSchema, type AuthFormState } from "@/lib/auth/schemas";

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validatedFields = AuthFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "Ya existe una cuenta con ese email." };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  await createSession(user.id);
  redirect("/");
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

  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/");
}
