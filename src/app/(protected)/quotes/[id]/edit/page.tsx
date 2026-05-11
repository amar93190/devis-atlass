import Link from "next/link";
import { notFound } from "next/navigation";
import { updateQuoteAction } from "@/app/(protected)/quotes/actions";
import { QuoteForm, type QuoteFormInitialData } from "@/components/quote-form";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAYMENT_METHOD = "A reception de facture";
const LEGACY_PAYMENT_TERMS_PREFIX = "Conditions de règlement:";

function getPaymentMethod(notes: string | null) {
  const value = notes?.trim() || "";
  if (!value || value.startsWith(LEGACY_PAYMENT_TERMS_PREFIX)) {
    return DEFAULT_PAYMENT_METHOD;
  }
  return value;
}

type EditQuotePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditQuotePage({ params, searchParams }: EditQuotePageProps) {
  const { id } = await params;
  const { error } = await searchParams;

  const [quote, clients] = await Promise.all([
    prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    }),
    prisma.client.findMany({ orderBy: { companyName: "asc" } }),
  ]);

  if (!quote) notFound();

  const initialData: QuoteFormInitialData = {
    id: quote.id,
    clientId: quote.clientId,
    quoteNumber: quote.quoteNumber,
    date: quote.date.toISOString().slice(0, 10),
    paymentMethod: getPaymentMethod(quote.notes),
    items: quote.items.map((item) => ({
      code: item.label,
      description: item.description ?? "",
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    })),
    transport: Number(quote.transport),
    status: quote.status,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Modifier {quote.quoteNumber}</h2>
        <Link
          href={`/quotes/${quote.id}`}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Retour au devis
        </Link>
      </div>

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Vérifiez les données du devis.
        </p>
      )}

      <QuoteForm
        clients={clients}
        initialData={initialData}
        submitLabel="Mettre à jour le devis"
        action={updateQuoteAction}
      />
    </div>
  );
}
