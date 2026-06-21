import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, toMoney } from "@/lib/utils";
import { createInvoiceAction } from "../actions";

const VAT_RATE = 0.2;

export default async function NewInvoicePage() {
  const quotes = await prisma.quote.findMany({
    where: { invoice: null },
    orderBy: { date: "desc" },
    include: { client: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Créer une facture</h2>
        <Link
          href="/invoices"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Retour
        </Link>
      </div>

      <p className="text-sm text-slate-600">
        Sélectionnez un devis pour générer la facture correspondante.
      </p>

      {quotes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Tous les devis ont déjà une facture.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[540px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">N° Devis</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total TTC</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => {
                const totalHT = Number(quote.totalHT);
                const totalTTC = toMoney(totalHT + toMoney(totalHT * VAT_RATE));
                return (
                  <tr key={quote.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-900">{quote.quoteNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{quote.client.companyName}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(quote.date)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatCurrency(totalTTC)}
                    </td>
                    <td className="px-4 py-3">
                      <form action={createInvoiceAction}>
                        <input type="hidden" name="quoteId" value={quote.id} />
                        <button
                          type="submit"
                          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Créer la facture
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
