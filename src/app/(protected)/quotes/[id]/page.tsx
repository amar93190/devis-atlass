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
import { formatCurrency, formatDate } from "@/lib/utils";

type QuoteDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const statusOptions: Array<{ value: QuoteStatus; label: string }> = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "SENT", label: "Envoyé" },
  { value: "VALIDATED", label: "Validé" },
  { value: "CANCELLED", label: "Annulé" },
];

export default async function QuoteDetailsPage({ params }: QuoteDetailsPageProps) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, items: true, createdBy: true },
  });

  if (!quote) notFound();

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
          <p className="text-slate-500">Sous-total HT</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(Number(quote.subtotalHT))}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-slate-500">Transport HT</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(Number(quote.transport))}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-slate-500">Total HT</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(Number(quote.totalHT))}
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
