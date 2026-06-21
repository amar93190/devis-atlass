import Image from "next/image";
import { loginAction } from "@/app/login/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = params.error === "invalid-credentials";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/logo-atlas-sign.jpg"
            alt="Atlas Sign"
            width={72}
            height={72}
            className="rounded-xl object-contain"
          />
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Outil interne
            </p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">Atlas Sign</h1>
          </div>
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
            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
