import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, toMoney } from "@/lib/utils";
import { deleteDepositRequestAction } from "./actions";

const VAT_RATE = 0.2;

export default async function DepositRequestPage() {
  const requests = await prisma.depositRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { quote: { include: { client: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Demandes d&apos;acompte</h2>
        <Link
          href="/deposit-request/new"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
        >
          + Nouvelle demande
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Aucune demande d&apos;acompte.{" "}
          <Link href="/deposit-request/new" className="text-red-600 underline">
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
                <th className="px-4 py-3">Devis lié</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Montant HT</th>
                <th className="px-4 py-3">Total TTC</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((dr) => {
                const amountHT = Number(dr.amountHT);
                const totalTTC = toMoney(amountHT + toMoney(amountHT * VAT_RATE));
                return (
                  <tr key={dr.id} className="border-t border-slate-200 transition-colors hover:bg-red-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{dr.number}</td>
                    <td className="px-4 py-3 text-slate-700">{dr.quote.client.companyName}</td>
                    <td className="px-4 py-3">
                      <Link href={`/quotes/${dr.quote.id}`} className="text-slate-900 underline hover:text-red-600">
                        {dr.quote.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(dr.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(amountHT)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(totalTTC)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/deposit-request/${dr.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Télécharger
                        </a>
                        <form action={deleteDepositRequestAction}>
                          <input type="hidden" name="id" value={dr.id} />
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
