import Link from "next/link";
import { prisma } from "@/lib/prisma";

type ClientsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const clients = await prisma.client.findMany({
    where: query
      ? {
          OR: [
            { companyName: { contains: query, mode: "insensitive" } },
            { contactName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { companyName: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Clients</h2>
        <Link
          href="/clients/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Nouveau client
        </Link>
      </div>

      <form className="rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Recherche client</span>
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
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Adresse</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900">{client.companyName}</td>
                <td className="px-4 py-3 text-slate-700">{client.contactName}</td>
                <td className="px-4 py-3 text-slate-700">{client.email}</td>
                <td className="px-4 py-3 text-slate-700">{client.phone}</td>
                <td className="px-4 py-3 text-slate-700">{client.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
