"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/dal";

export async function toggleFavoriteProduct(productId: string): Promise<{ favorited: boolean }> {
  const user = await requireUser();

  const existing = await prisma.favoriteProduct.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.favoriteProduct.delete({ where: { id: existing.id } });
    revalidatePath("/");
    revalidatePath(`/producto/${productId}`);
    revalidatePath("/favoritos");
    return { favorited: false };
  }

  await prisma.favoriteProduct.create({ data: { userId: user.id, productId } });
  revalidatePath("/");
  revalidatePath(`/producto/${productId}`);
  revalidatePath("/favoritos");
  return { favorited: true };
}

export async function toggleFavoriteCategory(categorySlug: string): Promise<{ favorited: boolean }> {
  const user = await requireUser();

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    throw new Error(`Categoría desconocida: ${categorySlug}`);
  }

  const existing = await prisma.favoriteCategory.findUnique({
    where: { userId_categoryId: { userId: user.id, categoryId: category.id } },
  });

  if (existing) {
    await prisma.favoriteCategory.delete({ where: { id: existing.id } });
    revalidatePath("/");
    revalidatePath("/favoritos");
    return { favorited: false };
  }

  await prisma.favoriteCategory.create({ data: { userId: user.id, categoryId: category.id } });
  revalidatePath("/");
  revalidatePath("/favoritos");
  return { favorited: true };
}
