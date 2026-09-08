import LoginForm from "@/components/LoginForm";

const ERROR_MESSAGES: Record<string, string> = {
  token: "El enlace no es válido o ha caducado. Inicia sesión de nuevo para recibir uno nuevo.",
  google: "No hemos podido completar el inicio de sesión con Google. Inténtalo de nuevo.",
  google_email: "Tu cuenta de Google no tiene el email verificado, así que no podemos usarla.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-display font-bold text-gray-900">Iniciar sesión</h1>
      {errorMessage && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      <LoginForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} />
    </div>
  );
}
