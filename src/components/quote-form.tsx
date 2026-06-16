"use client";

import { QuoteStatus } from "@prisma/client";
import { useMemo, useRef, useState } from "react";
import { QUOTE_CODE_PRESETS, getQuoteCodeDescription, isKnownQuoteCode } from "@/lib/quote-presets";
import { computeQuoteTotals, type QuoteItemInput } from "@/lib/quote";
import { formatCurrency, toMoney, VAT_RATE } from "@/lib/utils";

type QuoteFormClient = {
  id: string;
  companyName: string;
  contactName: string;
};

export type QuoteFormInitialData = {
  id?: string;
  clientId: string;
  quoteNumber: string;
  date: string;
  paymentMethod: string;
  reference: string;
  items: QuoteItemInput[];
  transport: number;
  deposit: number;
  status: QuoteStatus;
};

type QuoteFormProps = {
  clients: QuoteFormClient[];
  initialData: QuoteFormInitialData;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
};

type QuoteItemDraft = {
  code: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

const statusOptions: Array<{ value: QuoteStatus; label: string }> = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "SENT", label: "Envoyé" },
  { value: "VALIDATED", label: "Validé" },
  { value: "CANCELLED", label: "Annulé" },
];
function createEmptyItem(): QuoteItemDraft {
  return {
    code: "",
    description: "",
    quantity: "",
    unitPrice: "",
  };
}

function toDraftItem(item: QuoteItemInput): QuoteItemDraft {
  return {
    code: item.code,
    description: item.description,
    quantity: Number(item.quantity || 0) === 0 ? "" : String(item.quantity),
    unitPrice: Number(item.unitPrice || 0) === 0 ? "" : String(item.unitPrice),
  };
}

function toNumber(value: string): number {
  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toInputItems(items: QuoteItemDraft[]): QuoteItemInput[] {
  return items.map((item) => ({
    code: item.code,
    description: item.description,
    quantity: toNumber(item.quantity),
    unitPrice: toNumber(item.unitPrice),
  }));
}

export function QuoteForm({
  clients,
  initialData,
  submitLabel,
  action,
}: QuoteFormProps) {
  const [items, setItems] = useState<QuoteItemDraft[]>(
    initialData.items.length > 0 ? initialData.items.map(toDraftItem) : [createEmptyItem()],
  );
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [deposit, setDeposit] = useState<string>(
    initialData.deposit > 0 ? String(initialData.deposit) : "",
  );

  const inputItems = useMemo(() => toInputItems(items), [items]);
  const totals = useMemo(
    () => computeQuoteTotals(inputItems, initialData.transport),
    [inputItems, initialData.transport],
  );
  const totalTVA = useMemo(() => toMoney(totals.totalHT * VAT_RATE), [totals.totalHT]);
  const totalTTC = useMemo(() => toMoney(totals.totalHT + totalTVA), [totals.totalHT, totalTVA]);
  const depositAmount = useMemo(() => toMoney(toNumber(deposit)), [deposit]);
  const balance = useMemo(() => toMoney(totalTTC - depositAmount), [totalTTC, depositAmount]);

  function getOptionsForItem(code: string) {
    if (!code || isKnownQuoteCode(code)) {
      return QUOTE_CODE_PRESETS;
    }

    return [
      {
        code,
        label: `${code} (personnalisé)`,
        description: "",
      },
      ...QUOTE_CODE_PRESETS,
    ];
  }

  function updateItem(
    index: number,
    key: keyof QuoteItemDraft,
    value: string,
  ) {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;

        if (key === "code") {
          const nextCode = String(value);
          return {
            ...item,
            code: nextCode,
            description: getQuoteCodeDescription(nextCode),
          };
        }

        if (key === "description") {
          return {
            ...item,
            description: value,
          };
        }

        return {
          ...item,
          [key]: value,
        };
      }),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, createEmptyItem()]);
  }

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragOver(event: React.DragEvent, index: number) {
    event.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    const from = dragIndexRef.current;
    if (from === null || from === index) {
      setDragOverIndex(null);
      return;
    }
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));
  }

  return (
    <form action={action} className="space-y-6">
      {initialData.id && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="itemsJson" value={JSON.stringify(inputItems)} />
      <input type="hidden" name="transport" value={initialData.transport} />
      <input type="hidden" name="deposit" value={toNumber(deposit)} />

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Client</span>
          <select
            name="clientId"
            required
            defaultValue={initialData.clientId}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">Sélectionner</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName} ({client.contactName})
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Numéro de devis</span>
          <input
            name="quoteNumber"
            required
            defaultValue={initialData.quoteNumber}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Date</span>
          <input
            type="date"
            name="date"
            required
            defaultValue={initialData.date}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Mode de règlement</span>
          <input
            name="paymentMethod"
            defaultValue={initialData.paymentMethod}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">Référence</span>
          <input
            name="reference"
            required
            defaultValue={initialData.reference}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>

      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Lignes de devis</h2>
          <button
            type="button"
            onClick={addItem}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Ajouter une ligne
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const lineTotal = toNumber(item.quantity) * toNumber(item.unitPrice);
            const options = getOptionsForItem(item.code);

            return (
              <div
                key={`item-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`flex gap-2 rounded-lg border p-3 transition-colors ${
                  dragOverIndex === index
                    ? "border-slate-400 bg-slate-50"
                    : "border-slate-200"
                }`}
              >
                <div className="flex shrink-0 items-start pt-6">
                  <div
                    className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 select-none"
                    title="Glisser pour réordonner"
                  >
                    <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
                      <circle cx="5" cy="4" r="1.5" />
                      <circle cx="11" cy="4" r="1.5" />
                      <circle cx="5" cy="10" r="1.5" />
                      <circle cx="11" cy="10" r="1.5" />
                      <circle cx="5" cy="16" r="1.5" />
                      <circle cx="11" cy="16" r="1.5" />
                    </svg>
                  </div>
                </div>

                <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-12">

                <label className="md:col-span-3">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Code</span>
                  <select
                    required
                    value={item.code}
                    onChange={(event) => updateItem(index, "code", event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Sélectionner un code</option>
                    {options.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="md:col-span-4">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Description</span>
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(event) => updateItem(index, "description", event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Description de la ligne"
                  />
                </label>

                <label className="md:col-span-1">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Quantité</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={item.quantity}
                    onChange={(event) => updateItem(index, "quantity", event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1 block text-xs font-medium text-slate-600">
                    Prix unitaire HT
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={item.unitPrice}
                    onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <div className="md:col-span-1">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Total ligne</span>
                  <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
                    {formatCurrency(lineTotal)}
                  </p>
                </div>

                <div className="md:col-span-1">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Action</span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="w-full rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
                  >
                    Suppr.
                  </button>
                </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">Statut</span>
          <select
            name="status"
            defaultValue={initialData.status}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
          <p className="font-semibold text-slate-900">Conditions automatiques du devis</p>
          <p className="mt-1">Délai: 2 à 3 semaines après validation du BAT.</p>
          <p>Les délais seront communiqués à l&apos;envoi de la facture.</p>
          <p>Conditions de règlement: acompte de 50% à la commande, solde à la livraison.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-600">Total HT</span>
            <span className="font-semibold">{formatCurrency(totals.totalHT)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-600">TVA 20%</span>
            <span className="font-semibold">{formatCurrency(totalTVA)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-base font-bold">
            <span>Total TTC</span>
            <span>{formatCurrency(totalTTC)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 pt-1">
            <label className="flex items-center gap-2 text-slate-600">
              <span>Acompte (€)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm text-right"
                placeholder="0,00"
              />
            </label>
            <span className="font-semibold">{formatCurrency(depositAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Solde à la livraison</span>
            <span className="font-semibold">{formatCurrency(balance)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
