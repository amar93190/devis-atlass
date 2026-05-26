import Link from "next/link";
import { importClientsAction } from "@/app/(protected)/clients/actions";

type ImportPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ImportClientsPage({ searchParams }: ImportPageProps) {
  const { error } = await searchParams;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Importer des contacts</h2>
        <Link
          href="/clients"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Retour
        </Link>
      </div>

      {error === "no-file" && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Veuillez sélectionner un fichier Excel.
        </p>
      )}
      {error === "empty-file" && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Le fichier est vide ou illisible.
        </p>
      )}

      <form action={importClientsAction} encType="multipart/form-data" className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Fichier Excel (.xlsx ou .xls)</span>
            <input
              type="file"
              name="file"
              accept=".xlsx,.xls,.csv"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium"
            />
          </label>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 space-y-2">
            <p className="font-semibold text-slate-700">Format attendu</p>
            <p>Ton fichier doit avoir une ligne d'en-tête avec les colonnes suivantes :</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {["Entreprise", "Contact", "Email", "Téléphone (optionnel)", "Adresse (optionnel)"].map((col) => (
                <code key={col} className="rounded bg-white border border-slate-200 px-2 py-0.5 text-xs">{col}</code>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Les contacts avec un email déjà existant seront ignorés.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Importer
          </button>
        </div>
      </form>
    </div>
  );
}
