import { loginAction } from "@/app/login/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = params.error === "invalid-credentials";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Connexion interne
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Devis Express</h1>
        </div>

        {hasError && (
          <p className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Identifiants invalides.
          </p>
        )}

        <form action={loginAction} className="space-y-4" autoComplete="off">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue=""
              autoComplete="off"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="mail"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Mot de passe</span>
            <input
              name="password"
              type="password"
              required
              defaultValue=""
              autoComplete="new-password"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Votre mot de passe"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
