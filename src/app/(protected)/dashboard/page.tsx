import Link from "next/link";
import { QuoteStatus } from "@prisma/client";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [totalQuotes, totalClients, draftQuotes, sentQuotes, validatedQuotes, recentQuotes] =
    await Promise.all([
      prisma.quote.count(),
      prisma.client.count(),
      prisma.quote.count({ where: { status: QuoteStatus.DRAFT } }),
      prisma.quote.count({ where: { status: QuoteStatus.SENT } }),
      prisma.quote.count({ where: { status: QuoteStatus.VALIDATED } }),
      prisma.quote.findMany({
        take: 8,
        orderBy: { updatedAt: "desc" },
        include: { client: true },
      }),
    ]);

  const cards = [
    { label: "Total devis", value: totalQuotes },
    { label: "Brouillons", value: draftQuotes },
    { label: "Envoyés", value: sentQuotes },
    { label: "Validés", value: validatedQuotes },
    { label: "Clients", value: totalClients },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
        <Link
          href="/quotes/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Nouveau devis
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">
        <header className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Derniers devis</h3>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">N° devis</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total HT</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentQuotes.map((quote) => (
                <tr key={quote.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link href={`/quotes/${quote.id}`} className="hover:underline">
                      {quote.quoteNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{quote.client.companyName}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(quote.date)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {formatCurrency(Number(quote.totalHT))}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={quote.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
