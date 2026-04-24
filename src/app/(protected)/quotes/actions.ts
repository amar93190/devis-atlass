"use server";

import { QuoteStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { computeQuoteTotals, parseItemsFromForm } from "@/lib/quote";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

const DEFAULT_PRODUCTION_DELAY = "2 à 3 semaines après validation du BAT.";
const DEFAULT_TRANSPORT_DELAY = "Les délais seront communiqués à l'envoi de la facture.";
const DEFAULT_PAYMENT_TERMS =
  "Conditions de règlement: acompte de 50% à la commande, solde à la livraison.";

const VALID_STATUSES = new Set(Object.values(QuoteStatus));

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getStatus(formData: FormData): QuoteStatus {
  const value = getString(formData, "status");
  if (VALID_STATUSES.has(value as QuoteStatus)) {
    return value as QuoteStatus;
  }
  return QuoteStatus.DRAFT;
}

function getDate(dateRaw: string) {
  const parsedDate = new Date(dateRaw);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

export async function createQuoteAction(formData: FormData) {
  const user = await requireAuth();

  const clientId = getString(formData, "clientId");
  const quoteNumber = getString(formData, "quoteNumber");
  const dateRaw = getString(formData, "date");
  const reference = getString(formData, "reference") || quoteNumber;
  const description = getString(formData, "description");
  const status = getStatus(formData);
  const transportRaw = getString(formData, "transport");

  if (!clientId || !quoteNumber || !description) {
    redirect("/quotes/new?error=invalid-form");
  }

  const items = parseItemsFromForm(formData.get("itemsJson"));
  const transport = toNumber(transportRaw || "0");
  const totals = computeQuoteTotals(items, transport);

  if (totals.items.length === 0) {
    redirect("/quotes/new?error=missing-items");
  }

  await prisma.quote.create({
    data: {
      quoteNumber,
      clientId,
      date: getDate(dateRaw),
      reference,
      description,
      quantity: totals.items[0]?.quantity ?? 0,
      unitPrice: totals.items[0]?.unitPrice ?? 0,
      transport,
      subtotalHT: totals.subtotalHT,
      totalHT: totals.totalHT,
      productionDelay: DEFAULT_PRODUCTION_DELAY,
      transportDelay: DEFAULT_TRANSPORT_DELAY,
      status,
      notes: DEFAULT_PAYMENT_TERMS,
      createdById: user.id,
      items: {
        create: totals.items.map((item) => ({
          label: item.code,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/quotes");
  redirect("/quotes");
}

export async function updateQuoteAction(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") || "");
  if (!id) {
    redirect("/quotes?error=missing-id");
  }

  const clientId = getString(formData, "clientId");
  const quoteNumber = getString(formData, "quoteNumber");
  const dateRaw = getString(formData, "date");
  const reference = getString(formData, "reference") || quoteNumber;
  const description = getString(formData, "description");
  const status = getStatus(formData);
  const transportRaw = getString(formData, "transport");

  if (!clientId || !quoteNumber || !description) {
    redirect(`/quotes/${id}/edit?error=invalid-form`);
  }

  const items = parseItemsFromForm(formData.get("itemsJson"));
  const transport = toNumber(transportRaw || "0");
  const totals = computeQuoteTotals(items, transport);

  if (totals.items.length === 0) {
    redirect(`/quotes/${id}/edit?error=missing-items`);
  }

  await prisma.quote.update({
    where: { id },
    data: {
      quoteNumber,
      clientId,
      date: getDate(dateRaw),
      reference,
      description,
      quantity: totals.items[0]?.quantity ?? 0,
      unitPrice: totals.items[0]?.unitPrice ?? 0,
      transport,
      subtotalHT: totals.subtotalHT,
      totalHT: totals.totalHT,
      productionDelay: DEFAULT_PRODUCTION_DELAY,
      transportDelay: DEFAULT_TRANSPORT_DELAY,
      status,
      notes: DEFAULT_PAYMENT_TERMS,
      items: {
        deleteMany: {},
        create: totals.items.map((item) => ({
          label: item.code,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
  redirect(`/quotes/${id}`);
}

export async function deleteQuoteAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") || "");
  if (!id) {
    redirect("/quotes?error=missing-id");
  }

  await prisma.quote.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/quotes");
  redirect("/quotes");
}

export async function duplicateQuoteAction(formData: FormData) {
  const user = await requireAuth();
  const id = String(formData.get("id") || "");
  if (!id) {
    redirect("/quotes?error=missing-id");
  }

  const source = await prisma.quote.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!source) {
    redirect("/quotes?error=not-found");
  }

  const duplicateNumber = `${source.quoteNumber}-COPY-${Date.now().toString().slice(-4)}`;

  const quote = await prisma.quote.create({
    data: {
      quoteNumber: duplicateNumber,
      clientId: source.clientId,
      date: new Date(),
      reference: source.reference,
      description: source.description,
      quantity: source.quantity,
      unitPrice: source.unitPrice,
      transport: source.transport,
      subtotalHT: source.subtotalHT,
      totalHT: source.totalHT,
      productionDelay: DEFAULT_PRODUCTION_DELAY,
      transportDelay: DEFAULT_TRANSPORT_DELAY,
      status: QuoteStatus.DRAFT,
      notes: DEFAULT_PAYMENT_TERMS,
      createdById: user.id,
      items: {
        create: source.items.map((item) => ({
          label: item.label,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      },
    },
  });

  revalidatePath("/quotes");
  redirect(`/quotes/${quote.id}`);
}

export async function updateQuoteStatusAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as QuoteStatus;

  if (!id || !status || !Object.values(QuoteStatus).includes(status)) {
    redirect("/quotes?error=invalid-status");
  }

  await prisma.quote.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/dashboard");
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
}
