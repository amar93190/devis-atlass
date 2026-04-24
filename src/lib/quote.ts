import { QuoteStatus } from "@prisma/client";
import { toMoney } from "@/lib/utils";

export type QuoteItemInput = {
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type QuoteFormValues = {
  clientId: string;
  quoteNumber: string;
  date: string;
  reference: string;
  description: string;
  items: QuoteItemInput[];
  transport: number;
  productionDelay: string;
  transportDelay: string;
  notes?: string;
  status: QuoteStatus;
};

export function sanitizeItems(items: QuoteItemInput[]) {
  return items
    .map((item) => ({
      code: item.code.trim(),
      description: item.description.trim(),
      quantity: toMoney(item.quantity),
      unitPrice: toMoney(item.unitPrice),
    }))
    .filter((item) => item.code && item.quantity > 0);
}

export function computeQuoteTotals(items: QuoteItemInput[], transport: number) {
  const normalizedItems = sanitizeItems(items).map((item) => ({
    ...item,
    total: toMoney(item.quantity * item.unitPrice),
  }));

  const subtotalHT = toMoney(
    normalizedItems.reduce((sum, item) => sum + item.total, 0),
  );

  const totalHT = toMoney(subtotalHT + toMoney(transport));

  return {
    items: normalizedItems,
    subtotalHT,
    totalHT,
  };
}

export function parseItemsFromForm(raw: FormDataEntryValue | null): QuoteItemInput[] {
  if (!raw || typeof raw !== "string") return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      code: String(item.code ?? ""),
      description: String(item.description ?? ""),
      quantity: Number(item.quantity ?? 0),
      unitPrice: Number(item.unitPrice ?? 0),
    }));
  } catch {
    return [];
  }
}
