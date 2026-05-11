import Link from "next/link";
import { createQuoteAction } from "@/app/(protected)/quotes/actions";
import { QuoteForm, type QuoteFormInitialData } from "@/components/quote-form";
import { prisma } from "@/lib/prisma";

const QUOTE_PREFIX = "DE";
const QUOTE_START_NUMBER = 22413;
const DEFAULT_PAYMENT_METHOD = "A réception de facture";

function buildDefaultQuoteNumber(existingQuoteNumbers: string[]) {
  const maxExisting = existingQuoteNumbers.reduce((max, quoteNumber) => {
    const match = quoteNumber.match(/^DE(\d+)$/);
    if (!match) return max;

    const value = Number(match[1]);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, QUOTE_START_NUMBER - 1);

  return `${QUOTE_PREFIX}${maxExisting + 1}`;
}

type NewQuotePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewQuotePage({ searchParams }: NewQuotePageProps) {
  const params = await searchParams;
  const [clients, deQuotes] = await Promise.all([
    prisma.client.findMany({ orderBy: { companyName: "asc" } }),
    prisma.quote.findMany({
      where: { quoteNumber: { startsWith: QUOTE_PREFIX } },
      select: { quoteNumber: true },
    }),
  ]);

  const initialData: QuoteFormInitialData = {
    clientId: "",
    quoteNumber: buildDefaultQuoteNumber(deQuotes.map((quote) => quote.quoteNumber)),
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: DEFAULT_PAYMENT_METHOD,
    items: [{ code: "", description: "", quantity: 1, unitPrice: 0 }],
    transport: 0,
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
