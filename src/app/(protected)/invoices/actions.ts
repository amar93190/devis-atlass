"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const INVOICE_PREFIX = "FA";
const INVOICE_START_NUMBER = 1;

function buildInvoiceNumber(existing: string[]): string {
  const max = existing.reduce((acc, n) => {
    const match = n.match(/^FA(\d+)$/);
    if (!match) return acc;
    const val = Number(match[1]);
    return Number.isFinite(val) ? Math.max(acc, val) : acc;
  }, INVOICE_START_NUMBER - 1);
  return `${INVOICE_PREFIX}${String(max + 1).padStart(5, "0")}`;
}

export async function createInvoiceAction(formData: FormData) {
  const user = await requireAuth();
  const quoteId = String(formData.get("quoteId") || "");

  if (!quoteId) redirect("/invoices?error=missing-quote");

  const existing = await prisma.invoice.findUnique({ where: { quoteId } });
  if (existing) redirect(`/invoices?error=already-exists`);

  const allNumbers = await prisma.invoice.findMany({ select: { invoiceNumber: true } });
  const invoiceNumber = buildInvoiceNumber(allNumbers.map((i) => i.invoiceNumber));

  await prisma.invoice.create({
    data: {
      invoiceNumber,
      quoteId,
      createdById: user.id,
    },
  });

  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function deleteInvoiceAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") || "");
  if (!id) redirect("/invoices?error=missing-id");

  await prisma.invoice.delete({ where: { id } });

  revalidatePath("/invoices");
  redirect("/invoices");
}
