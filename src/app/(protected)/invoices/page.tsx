import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, toMoney } from "@/lib/utils";
import { deleteInvoiceAction } from "./actions";

const VAT_RATE = 0.2;

type InvoicesPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const { error } = await searchParams;

  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      quote: { include: { client: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Factures</h2>
        <Link
          href="/invoices/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Créer une facture
        </Link>
      </div>

      {error === "already-exists" && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Une facture existe déjà pour ce devis.
        </p>
      )}

      {invoices.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Aucune facture pour le moment.{" "}
          <Link href="/invoices/new" className="text-slate-900 underline">
            Créer la première
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">N° Facture</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Devis</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total TTC</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const totalHT = Number(invoice.quote.totalHT);
                const totalTTC = toMoney(totalHT + toMoney(totalHT * VAT_RATE));
                return (
                  <tr key={invoice.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {invoice.quote.client.companyName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <Link
                        href={`/quotes/${invoice.quote.id}`}
                        className="text-slate-900 underline hover:text-slate-600"
                      >
                        {invoice.quote.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatCurrency(totalTTC)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/quotes/${invoice.quote.id}/invoice`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Télécharger
                        </a>
                        <form action={deleteInvoiceAction}>
                          <input type="hidden" name="id" value={invoice.id} />
                          <button
                            type="submit"
                            className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                          >
                            Supprimer
                          </button>
                        </form>
                      </div>
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
