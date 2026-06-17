import Link from "next/link";
import { QuoteStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import {
  deleteQuoteAction,
  duplicateQuoteAction,
  updateQuoteStatusAction,
} from "@/app/(protected)/quotes/actions";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, toMoney } from "@/lib/utils";

type QuoteDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const statusOptions: Array<{ value: QuoteStatus; label: string }> = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "SENT", label: "Envoyé" },
  { value: "VALIDATED", label: "Validé" },
  { value: "CANCELLED", label: "Annulé" },
];
const VAT_RATE = 0.2;

export default async function QuoteDetailsPage({ params }: QuoteDetailsPageProps) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, items: true, createdBy: true, invoice: true },
  });

  if (!quote) notFound();

  const totalHT = Number(quote.totalHT);
  const totalTVA = toMoney(totalHT * VAT_RATE);
  const totalTTC = toMoney(totalHT + totalTVA);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{quote.quoteNumber}</h2>
          <p className="text-sm text-slate-600">
            {quote.client.companyName} · {formatDate(quote.date)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/quotes/${id}/edit`}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Modifier
          </Link>
          <a
            href={`/api/quotes/${id}/pdf`}
            target="_blank"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            rel="noreferrer"
          >
            Télécharger PDF
          </a>
          {quote.invoice ? (
            <a
              href={`/api/quotes/${id}/invoice`}
              target="_blank"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              rel="noreferrer"
            >
              Télécharger la facture ({quote.invoice.invoiceNumber})
            </a>
          ) : (
            <Link
              href={`/invoices/new`}
              className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
            >
              Créer la facture
            </Link>
          )}
          <Link
            href="/quotes"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Retour
          </Link>
        </div>
      </div>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <div className="space-y-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client</p>
          <p className="font-semibold text-slate-900">{quote.client.companyName}</p>
          <p className="text-slate-700">{quote.client.contactName}</p>
          <p className="text-slate-700">{quote.client.email}</p>
          <p className="text-slate-700">{quote.client.phone}</p>
          <p className="text-slate-700">{quote.client.address}</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Informations</p>
          <p className="text-slate-700">
            <span className="font-medium">Référence:</span> {quote.reference}
          </p>
          <p className="text-slate-700">
            <span className="font-medium">Description:</span> {quote.description}
          </p>
          <p className="text-slate-700">
            <span className="font-medium">Créé par:</span> {quote.createdBy.name}
          </p>
          <div>
            <StatusBadge status={quote.status} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3">Prix unitaire HT</th>
              <th className="px-4 py-3">Total ligne HT</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item) => (
              <tr key={item.id} className="border-t border-slate-200">
                <td className="px-4 py-3 text-slate-900">{item.label}</td>
                <td className="px-4 py-3 text-slate-700 whitespace-pre-wrap">
                  {item.description || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">{Number(item.quantity).toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-700">{formatCurrency(Number(item.unitPrice))}</td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {formatCurrency(Number(item.total))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-slate-500">Total HT</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(totalHT)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-slate-500">TVA 20%</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(totalTVA)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-slate-500">Total TTC</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(totalTTC)}
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Délais et règlement
        </h3>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <p>Délai: 2 à 3 semaines après validation du BAT.</p>
          <p>Les délais seront communiqués à l&apos;envoi de la facture.</p>
          <p>Conditions de règlement: acompte de 50% à la commande, solde à la livraison.</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap gap-2">
          <form action={updateQuoteStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={quote.id} />
            <select
              name="status"
              defaultValue={quote.status}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Mettre à jour le statut
            </button>
          </form>

          <form action={duplicateQuoteAction}>
            <input type="hidden" name="id" value={quote.id} />
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Dupliquer
            </button>
          </form>

          <form action={deleteQuoteAction}>
            <input type="hidden" name="id" value={quote.id} />
            <button
              type="submit"
              className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              Supprimer
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
