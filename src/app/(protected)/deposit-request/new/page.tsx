import { prisma } from "@/lib/prisma";
import { DepositRequestForm } from "./form";

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function NewDepositRequestPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      quote: { include: { client: true } },
    },
  });

  const invoiceData = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    quoteId: inv.quoteId,
    quoteNumber: inv.quote.quoteNumber,
    quoteDate: inv.quote.date.toISOString(),
    reference: inv.quote.reference,
    totalHT: Number(inv.quote.totalHT),
    clientCompany: inv.quote.client.companyName,
  }));

  return <DepositRequestForm invoices={invoiceData} error={error} />;
}
