import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Crear cuenta</h1>
      <SignupForm />
    </div>
  );
}
