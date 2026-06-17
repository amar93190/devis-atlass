import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateInvoicePdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const [quote, invoice] = await Promise.all([
    prisma.quote.findUnique({ where: { id }, include: { client: true, items: true } }),
    prisma.invoice.findUnique({ where: { quoteId: id } }),
  ]);

  if (!quote) {
    return NextResponse.json({ message: "Quote not found" }, { status: 404 });
  }

  const pdfBuffer = await generateInvoicePdf({
    quoteNumber: quote.quoteNumber,
    invoiceNumber: invoice?.invoiceNumber,
    date: quote.date,
    reference: quote.reference,
    description: quote.description,
    transport: Number(quote.transport),
    subtotalHT: Number(quote.subtotalHT),
    totalHT: Number(quote.totalHT),
    deposit: Number(quote.deposit),
    productionDelay: quote.productionDelay,
    transportDelay: quote.transportDelay,
    notes: quote.notes,
    client: {
      companyName: quote.client.companyName,
      contactName: quote.client.contactName,
      email: quote.client.email,
      phone: quote.client.phone,
      address: quote.client.address,
    },
    items: quote.items.map((item) => ({
      label: item.label,
      description: item.description ?? "",
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    })),
  });

  return new NextResponse(pdfBuffer as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="FACTURE-${invoice?.invoiceNumber ?? quote.quoteNumber}.pdf"`,
    },
  });
}
