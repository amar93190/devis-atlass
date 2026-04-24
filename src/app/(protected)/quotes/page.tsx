import Link from "next/link";
import { deleteQuoteAction, duplicateQuoteAction } from "@/app/(protected)/quotes/actions";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

type QuotesPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const quotes = await prisma.quote.findMany({
    where: query
      ? {
          OR: [
            { quoteNumber: { contains: query, mode: "insensitive" } },
            { reference: { contains: query, mode: "insensitive" } },
            { client: { companyName: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Devis</h2>
        <Link
          href="/quotes/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Nouveau devis
        </Link>
      </div>

      <form className="rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Recherche devis</span>
          <input
            name="q"
            defaultValue={query}
            placeholder="N° devis, référence, client"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </form>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">N° devis</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Total HT</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/quotes/${quote.id}`} className="hover:underline">
                    {quote.quoteNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">{quote.client.companyName}</td>
                <td className="px-4 py-3 text-slate-700">{formatDate(quote.date)}</td>
                <td className="px-4 py-3 text-slate-700">{quote.reference}</td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {formatCurrency(Number(quote.totalHT))}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={quote.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/quotes/${quote.id}/edit`}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                    >
                      Modifier
                    </Link>
                    <form action={duplicateQuoteAction}>
                      <input type="hidden" name="id" value={quote.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        Dupliquer
                      </button>
                    </form>
                    <form action={deleteQuoteAction}>
                      <input type="hidden" name="id" value={quote.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
