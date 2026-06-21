import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, toMoney } from "@/lib/utils";
import { createDepositRequestAction } from "../actions";

const VAT_RATE = 0.2;

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function NewDepositRequestPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  const quotes = await prisma.quote.findMany({
    orderBy: { date: "desc" },
    include: { client: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Nouvelle demande d&apos;acompte</h2>
        <Link
          href="/deposit-request"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Retour
        </Link>
      </div>

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Veuillez remplir tous les champs obligatoires.
        </p>
      )}

      <form action={createDepositRequestAction} className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Devis associé <span className="text-rose-500">*</span></span>
            <select
              name="quoteId"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">Sélectionner un devis</option>
              {quotes.map((q) => {
                const totalHT = Number(q.totalHT);
                const totalTTC = toMoney(totalHT + toMoney(totalHT * VAT_RATE));
                return (
                  <option key={q.id} value={q.id}>
                    {q.quoteNumber} — {q.client.companyName} — {formatDate(q.date)} — {formatCurrency(totalTTC)} TTC
                  </option>
                );
              })}
            </select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Mode de règlement</span>
            <input
              name="paymentMethod"
              defaultValue="Virement SEPA"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Description <span className="text-rose-500">*</span></span>
            <textarea
              name="description"
              required
              rows={4}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Ex : Demande d'acompte pour la commande référencée ADOPT Stock MARS, conformément à notre devis N°22402 du 12/03/2026. Le montant s'élève à 15 733,00€ HT."
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Montant HT (€) <span className="text-rose-500">*</span></span>
            <input
              name="amountHT"
              type="number"
              min="0"
              step="0.01"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="7000.00"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Créer la demande d&apos;acompte
          </button>
        </div>
      </form>
    </div>
  );
}
