import Link from "next/link";
import { sendCampaignAction } from "@/app/(protected)/campaigns/actions";
import { prisma } from "@/lib/prisma";

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

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Message</span>
            <textarea
              name="body"
              required
              rows={10}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Bonjour,&#10;&#10;..."
            />
          </label>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Destinataires</h3>
            <span className="text-xs text-slate-500">{clients.length} client(s)</span>
          </div>

          <div className="space-y-2">
            {clients.map((client) => (
              <label key={client.id} className="flex items-center gap-3 cursor-pointer rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                <input
                  type="checkbox"
                  name="clientIds"
                  value={client.id}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{client.companyName}</p>
                  <p className="text-slate-500">{client.contactName} · {client.email}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Envoyer la campagne
          </button>
        </div>
      </form>
    </div>
  );
}
