"use client";

import Link from "next/link";
import { useState } from "react";
import { createDepositRequestAction } from "../actions";
import { formatCurrency, formatDate } from "@/lib/utils";

type InvoiceOption = {
  id: string;
  invoiceNumber: string;
  quoteId: string;
  quoteNumber: string;
  quoteDate: string;
  reference: string;
  totalHT: number;
  clientCompany: string;
};

function buildDescription(inv: InvoiceOption): string {
  return `Demande d'acompte pour la commande référencée ${inv.reference}, conformément à notre devis N°${inv.quoteNumber} du ${formatDate(inv.quoteDate)}. Le montant s'élève à ${formatCurrency(inv.totalHT)} HT.`;
}

export function DepositRequestForm({
  invoices,
  error,
}: {
  invoices: InvoiceOption[];
  error?: string;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [description, setDescription] = useState("");
  const [quoteId, setQuoteId] = useState("");

  function handleSelect(invoiceId: string) {
    setSelectedId(invoiceId);
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      setDescription(buildDescription(inv));
      setQuoteId(inv.quoteId);
    } else {
      setDescription("");
      setQuoteId("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Nouvelle demande d&apos;acompte</h2>
        <Link
          href="/deposit-request"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Retour
        </Link>
      </div>

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Veuillez remplir tous les champs obligatoires.
        </p>
      )}

      {invoices.length === 0 && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Aucune facture disponible. Créez d&apos;abord une facture depuis un devis.
        </p>
      )}

      <form action={createDepositRequestAction} className="space-y-5">
        <input type="hidden" name="quoteId" value={quoteId} />

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Facture associée <span className="text-rose-500">*</span></span>
            <select
              value={selectedId}
              onChange={(e) => handleSelect(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">Sélectionner une facture</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.clientCompany} — {inv.quoteNumber}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Mode de règlement</span>
            <input
              name="paymentMethod"
              defaultValue="Virement SEPA"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Description <span className="text-rose-500">*</span></span>
            <textarea
              name="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Sélectionnez une facture pour générer la description automatiquement…"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Montant HT (€) <span className="text-rose-500">*</span></span>
            <input
              name="amountHT"
              type="number"
              min="0"
              step="0.01"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="7000.00"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!selectedId}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Créer la demande d&apos;acompte
          </button>
        </div>
      </form>
    </div>
  );
}
