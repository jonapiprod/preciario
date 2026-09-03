export default function GoogleButton({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <>
      <a
        href="/api/auth/google/start"
        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.54-5.17 3.54-8.89z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-3.02c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.93H1.3v3.11A12 12 0 0 0 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.31 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.3a12 12 0 0 0 0 10.8z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.3 6.6l4.01 3.11C6.25 6.88 8.89 4.75 12 4.75z"
          />
        </svg>
        Continuar con Google
      </a>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        o
        <div className="h-px flex-1 bg-gray-200" />
      </div>
    </>
  );
}
