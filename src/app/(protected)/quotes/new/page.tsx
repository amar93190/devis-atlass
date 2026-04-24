import Link from "next/link";
import { createQuoteAction } from "@/app/(protected)/quotes/actions";
import { QuoteForm, type QuoteFormInitialData } from "@/components/quote-form";
import { prisma } from "@/lib/prisma";

function buildDefaultQuoteNumber(lastQuoteNumber: string | null) {
  if (!lastQuoteNumber) return "DEV-2026-0001";

  const parts = lastQuoteNumber.match(/^(.*-)(\d+)$/);
  if (!parts) return `DEV-2026-${Date.now().toString().slice(-4)}`;

  const prefix = parts[1];
  const value = Number(parts[2]) + 1;
  return `${prefix}${String(value).padStart(parts[2].length, "0")}`;
}

type NewQuotePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewQuotePage({ searchParams }: NewQuotePageProps) {
  const params = await searchParams;
  const clients = await prisma.client.findMany({ orderBy: { companyName: "asc" } });
  const lastQuote = await prisma.quote.findFirst({ orderBy: { createdAt: "desc" } });

  const initialData: QuoteFormInitialData = {
    clientId: "",
    quoteNumber: buildDefaultQuoteNumber(lastQuote?.quoteNumber ?? null),
    date: new Date().toISOString().slice(0, 10),
    reference: "",
    description: "",
    items: [{ code: "", description: "", quantity: 1, unitPrice: 0 }],
    transport: 0,
    productionDelay: "",
    transportDelay: "",
    notes: "",
    status: "DRAFT",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-slate-900">Nouveau devis</h2>
        <div className="flex items-center gap-2">
          <Link
            href="/clients/new"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Créer un client
          </Link>
          <Link
            href="/quotes"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Retour
          </Link>
        </div>
      </div>

      {params.error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Vérifiez les données du devis et les lignes.
        </p>
      )}

      <QuoteForm
        clients={clients}
        initialData={initialData}
        submitLabel="Enregistrer le devis"
        action={createQuoteAction}
      />
    </div>
  );
}
