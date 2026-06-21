import Link from "next/link";
import { sendCampaignAction } from "@/app/(protected)/campaigns/actions";
import { prisma } from "@/lib/prisma";
import { CampaignClientSelect } from "@/components/campaign-client-select";

type NewCampaignPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewCampaignPage({ searchParams }: NewCampaignPageProps) {
  const { error } = await searchParams;
  const clients = await prisma.client.findMany({ orderBy: { companyName: "asc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Nouvelle campagne</h2>
        <Link
          href="/campaigns"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Retour
        </Link>
      </div>

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Veuillez remplir tous les champs et sélectionner au moins un client.
        </p>
      )}

      <form action={sendCampaignAction} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Objet</span>
            <input
              name="subject"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Ex: Nouveau produit disponible"
            />
          </label>

          <div className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Message</span>
            <textarea
              name="body"
              required
              rows={10}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Bonjour {{prénom}},&#10;&#10;..."
            />
            <p className="text-xs text-slate-400">
              Variables disponibles :&nbsp;
              <code className="bg-slate-100 px-1 rounded">{"{{prénom}}"}</code>,&nbsp;
              <code className="bg-slate-100 px-1 rounded">{"{{nom}}"}</code>,&nbsp;
              <code className="bg-slate-100 px-1 rounded">{"{{entreprise}}"}</code>
              &nbsp;— remplacées automatiquement pour chaque client.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Destinataires</h3>
            <span className="text-xs text-slate-500">{clients.length} client(s)</span>
          </div>
          <CampaignClientSelect clients={clients} />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Envoyer la campagne
          </button>
        </div>
      </form>
    </div>
  );
}
