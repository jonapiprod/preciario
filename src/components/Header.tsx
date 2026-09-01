import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Chollos<span className="text-orange-600">Tech</span>
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-orange-600">
            Inicio
          </Link>
          <Link href="/errores-de-precio" className="hover:text-orange-600">
            🔥 Errores de precio
          </Link>
        </nav>
      </div>
    </header>
  );
}
