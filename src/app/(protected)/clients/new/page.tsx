import Link from "next/link";
import { createClientAction } from "@/app/(protected)/clients/actions";

type ClientNewPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewClientPage({ searchParams }: ClientNewPageProps) {
  const params = await searchParams;
  const hasError = Boolean(params.error);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Nouveau client</h2>
        <Link
          href="/clients"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Retour
        </Link>
      </div>

      <form action={createClientAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        {hasError && (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Vérifiez les informations saisies.
          </p>
        )}

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Entreprise</span>
          <input name="companyName" required className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Contact</span>
          <input name="contactName" required className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Email</span>
          <input type="email" name="email" required className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Téléphone</span>
          <input name="phone" required className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Adresse</span>
          <textarea name="address" rows={2} required className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Enregistrer le client
          </button>
        </div>
      </form>
    </div>
  );
}
