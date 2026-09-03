"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleFavoriteProduct, toggleFavoriteCategory } from "@/app/actions/favorites";

interface FavoriteButtonProps {
  kind: "product" | "category";
  id: string;
  initiallyFavorited: boolean;
  isLoggedIn: boolean;
  className?: string;
}

export default function FavoriteButton({
  kind,
  id,
  initiallyFavorited,
  isLoggedIn,
  className,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initiallyFavorited);
  const [isPending, startTransition] = useTransition();
  const [isWiggling, setIsWiggling] = useState(false);

  const colorClasses = favorited ? "text-red-600" : "text-gray-300 hover:text-red-500";
  const baseClasses = `text-lg leading-none transition ${colorClasses} ${
    isWiggling ? "animate-wiggle" : ""
  } ${className ?? ""}`;

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        aria-label="Inicia sesión para guardar en favoritos"
        onClick={(e) => e.stopPropagation()}
        className={baseClasses}
      >
        ♡
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label={favorited ? "Quitar de favoritos" : "Añadir a favoritos"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          const result =
            kind === "product" ? await toggleFavoriteProduct(id) : await toggleFavoriteCategory(id);
          setFavorited(result.favorited);
          setIsWiggling(true);
        });
      }}
      onAnimationEnd={() => setIsWiggling(false)}
      className={baseClasses}
    >
      {favorited ? "♥" : "♡"}
    </button>
  );
}
