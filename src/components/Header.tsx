import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { logout } from "@/app/actions/auth";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          Chollos<span className="text-red-600">Tech</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="nav-link">
            Inicio
          </Link>
          <Link href="/errores-de-precio" className="nav-link">
            🔥 Errores de precio
          </Link>
          {user ? (
            <>
              <Link href="/favoritos" className="nav-link">
                ❤️ Favoritos
              </Link>
              <Link href="/perfil" className="nav-link">
                Perfil
              </Link>
              <form action={logout}>
                <button type="submit" className="nav-link text-gray-500">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Entrar
              </Link>
              <Link href="/registro" className="nav-link">
                Registro
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
