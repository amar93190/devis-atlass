import Link from "next/link";
import { QuoteStatus } from "@prisma/client";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, toMoney } from "@/lib/utils";

const VAT_RATE = 0.2;

export default async function DashboardPage() {
  const [totalQuotes, totalClients, draftQuotes, sentQuotes, validatedQuotes, recentQuotes, totalInvoices] =
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
      prisma.invoice.count(),
    ]);

  const cards = [
    {
      label: "Total devis", value: totalQuotes, color: "bg-slate-800",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    },
    {
      label: "Brouillons", value: draftQuotes, color: "bg-slate-500",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    },
    {
      label: "Envoyés", value: sentQuotes, color: "bg-blue-600",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    },
    {
      label: "Validés", value: validatedQuotes, color: "bg-emerald-600",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    },
    {
      label: "Clients", value: totalClients, color: "bg-red-600",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    {
      label: "Factures", value: totalInvoices, color: "bg-orange-500",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
        <Link
          href="/quotes/new"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
        >
          + Nouveau devis
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <article key={card.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className={`${card.color} shrink-0 rounded-lg p-2 text-white`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-slate-500">{card.label}</p>
              <p className="mt-0.5 text-2xl font-bold leading-none text-slate-900">{card.value}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Derniers devis</h3>
          <Link href="/quotes" className="text-xs font-medium text-red-600 hover:underline">
            Voir tout →
          </Link>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">N° devis</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total TTC</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentQuotes.map((quote) => {
                const totalHT = Number(quote.totalHT);
                const totalTTC = toMoney(totalHT + toMoney(totalHT * VAT_RATE));
                return (
                  <tr key={quote.id} className="border-t border-slate-200 transition-colors hover:bg-red-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link href={`/quotes/${quote.id}`} className="hover:text-red-600">
                        {quote.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{quote.client.companyName}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(quote.date)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(totalTTC)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={quote.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
