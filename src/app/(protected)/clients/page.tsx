import Link from "next/link";
import { deleteClientAction } from "@/app/(protected)/clients/actions";
import { DeleteClientButton } from "@/components/delete-client-button";
import { prisma } from "@/lib/prisma";

type ClientsPageProps = {
  searchParams: Promise<{
    q?: string;
    tab?: string;
    imported?: string;
    skipped?: string;
    deleted?: string;
    error?: string;
  }>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const tab = params.tab === "imported" ? "imported" : "manual";

  const clients = await prisma.client.findMany({
    where: {
      source: tab === "imported" ? "IMPORTED" : "MANUAL",
      ...(query
        ? {
            OR: [
              { companyName: { contains: query, mode: "insensitive" } },
              { contactName: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { companyName: "asc" },
  });

  const tabClass = (active: boolean) =>
    active
      ? "rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
      : "rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Clients</h2>
        <div className="flex items-center gap-2">
          <Link href="/clients/import" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Importer Excel
          </Link>
          <Link href="/clients/new" className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Nouveau client
          </Link>
        </div>
      </div>

      {params.imported && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {params.imported} contact(s) importé(s){params.skipped && Number(params.skipped) > 0 ? `, ${params.skipped} ignoré(s) (email déjà existant ou données invalides)` : ""}.
        </p>
      )}

      {params.deleted && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Client supprimé.
        </p>
      )}

      {params.error === "client-has-quotes" && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Ce client possède des devis et ne peut pas être supprimé.
        </p>
      )}

      <div className="flex items-center gap-2">
        <Link href="/clients" className={tabClass(tab === "manual")}>Clients</Link>
        <Link href="/clients?tab=imported" className={tabClass(tab === "imported")}>Contacts importés</Link>
      </div>

      <form className="rounded-xl border border-slate-200 bg-white p-4">
        <input type="hidden" name="tab" value={tab} />
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Recherche</span>
          <input
            name="q"
            defaultValue={query}
            placeholder="Entreprise, contact ou email"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </form>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Email</th>
              {tab === "manual" && (
                <>
                  <th className="px-4 py-3">Téléphone</th>
                  <th className="px-4 py-3">Adresse</th>
                </>
              )}
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={tab === "manual" ? 6 : 4} className="px-4 py-8 text-center text-slate-400">
                  {tab === "imported" ? "Aucun contact importé." : "Aucun client."}
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="border-t border-slate-200 cursor-pointer transition-colors hover:bg-red-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link href={`/clients/${client.id}/edit`} className="block w-full">{client.companyName}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <Link href={`/clients/${client.id}/edit`} className="block w-full">{client.contactName}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <Link href={`/clients/${client.id}/edit`} className="block w-full">{client.email}</Link>
                  </td>
                  {tab === "manual" && (
                    <>
                      <td className="px-4 py-3 text-slate-700">
                        <Link href={`/clients/${client.id}/edit`} className="block w-full">{client.phone}</Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <Link href={`/clients/${client.id}/edit`} className="block w-full">{client.address}</Link>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 text-right">
                    <form action={deleteClientAction}>
                      <input type="hidden" name="id" value={client.id} />
                      <input type="hidden" name="tab" value={tab} />
                      <DeleteClientButton
                        companyName={client.companyName}
                        email={client.email}
                      />
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
