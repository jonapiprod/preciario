import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { logout } from "@/app/actions/auth";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Chollos<span className="text-orange-600">Tech</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-orange-600">
            Inicio
          </Link>
          <Link href="/errores-de-precio" className="hover:text-orange-600">
            🔥 Errores de precio
          </Link>
          {user ? (
            <>
              <Link href="/favoritos" className="hover:text-orange-600">
                ❤️ Favoritos
              </Link>
              <Link href="/perfil" className="hover:text-orange-600">
                Perfil
              </Link>
              <form action={logout}>
                <button type="submit" className="text-gray-500 hover:text-orange-600">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-orange-600">
                Entrar
              </Link>
              <Link href="/registro" className="hover:text-orange-600">
                Registro
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
