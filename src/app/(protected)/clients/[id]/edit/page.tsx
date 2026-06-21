import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateClientAction } from "@/app/(protected)/clients/actions";

type EditClientPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditClientPage({ params, searchParams }: EditClientPageProps) {
  const { id } = await params;
  const { error } = await searchParams;

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Modifier le client</h2>
        <Link
          href="/clients"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Retour
        </Link>
      </div>

      <form action={updateClientAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        {error && (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Vérifiez les informations saisies.
          </p>
        )}

        <input type="hidden" name="id" value={client.id} />

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Entreprise</span>
          <input name="companyName" defaultValue={client.companyName} required className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Contact</span>
          <input name="contactName" defaultValue={client.contactName} required className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Email</span>
          <input type="email" name="email" defaultValue={client.email} required className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Téléphone</span>
          <input name="phone" defaultValue={client.phone ?? ""} required className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Adresse</span>
          <textarea name="address" rows={2} defaultValue={client.address ?? ""} required className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
