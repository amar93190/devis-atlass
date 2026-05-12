import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import { formatCurrency, formatDate } from "@/lib/utils";

type PdfQuote = {
  quoteNumber: string;
  date: Date;
  reference: string;
  description: string;
  transport: number;
  subtotalHT: number;
  totalHT: number;
  productionDelay: string;
  transportDelay: string;
  notes: string | null;
  client: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    label: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
};

const logoDataUri = (() => {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo-atlas-sign.jpg");
    const logo = fs.readFileSync(logoPath);
    return `data:image/jpeg;base64,${logo.toString("base64")}`;
  } catch {
    return "";
  }
})();

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function splitClientAddress(address: string) {
  const normalized = address.trim().replace(/\s+/g, " ");
  const match = normalized.match(/^(.*?)[,\s-]*(\d{5}\s+.+)$/);

  if (!match) {
    return {
      line2: normalized,
      line3: "",
    };
  }

  return {
    line2: match[1].trim(),
    line3: match[2].trim().toUpperCase(),
  };
}

function getPaymentMethod(notes: string | null) {
  const value = notes?.trim() || "";
  if (!value || value.startsWith("Conditions de règlement:")) {
    return "A réception de facture";
  }
  if (value === "A reception de facture") {
    return "A réception de facture";
  }
  return value;
}

function buildHtml(quote: PdfQuote) {
  const logoMarkup = logoDataUri
    ? `<img src="${logoDataUri}" alt="Atlas Sign" class="company-logo" />`
    : `<div class="logo-fallback">ATLAS SIGN</div>`;
  const clientAddress = splitClientAddress(quote.client.address);
  const paymentMethod = getPaymentMethod(quote.notes);

  const items = quote.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.label)}</td>
          <td class="desc">${escapeHtml(item.description || "")}</td>
          <td class="number">${item.quantity.toFixed(2)}</td>
          <td class="number">${formatCurrency(item.unitPrice)}</td>
          <td class="number">${formatCurrency(item.total)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            margin: 24px;
            font-size: 12px;
            padding-bottom: 48px;
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            padding-bottom: 12px;
          }
          .content-separator {
            margin-top: 68px;
            margin-bottom: 12px;
            border-top: 2px solid #e5e7eb;
          }
          .company {
            max-width: 62%;
          }
          .company-logo {
            width: 60px;
            height: auto;
            display: block;
            margin-bottom: 8px;
          }
          .logo-fallback {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
          }
          .company-line {
            color: #374151;
            line-height: 1.35;
          }
          .document {
            text-align: right;
          }
          .document-badge {
            display: inline-block;
            background: #e5e7eb;
            border: 1px solid #9ca3af;
            padding: 6px 18px;
            margin-bottom: 8px;
          }
          .document-title {
            font-size: 28px;
            letter-spacing: 1px;
            font-weight: 800;
            color: #0f172a;
            line-height: 1;
          }
          .document-meta {
            margin-top: 6px;
            color: #374151;
            line-height: 1.4;
          }
          .client-window {
            margin-top: 88px;
            margin-left: auto;
            max-width: 320px;
            padding: 0;
            text-align: left;
          }
          .client-line {
            line-height: 1.35;
            color: #111827;
            margin-bottom: 2px;
          }
          .client-line:last-child {
            margin-bottom: 0;
          }
          .quote-meta-box {
            width: 100%;
            border: 1px solid #cfd6df;
            border-radius: 6px;
            padding: 8px;
            margin-bottom: 12px;
            text-align: left;
          }
          .quote-meta-grid {
            display: grid;
            grid-template-columns: 0.9fr 0.9fr 1.2fr 1.6fr;
            gap: 0;
            border: 1px solid #cfd6df;
          }
          .quote-meta-cell {
            border-right: 1px solid #cfd6df;
            padding: 6px 8px;
          }
          .quote-meta-cell:last-child {
            border-right: 0;
          }
          .quote-meta-label {
            background: #f3f4f6;
            color: #475569;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            border-bottom: 1px solid #cfd6df;
          }
          .quote-meta-value {
            color: #111827;
            font-size: 12px;
            font-weight: 400;
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
            word-break: break-word;
          }
          .meta-grid {
            margin-bottom: 14px;
          }
          .card {
            border: 1px solid #cfd6df;
            border-radius: 6px;
            padding: 9px;
          }
          .title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #475569;
            margin-bottom: 6px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14px;
          }
          th, td {
            border: 1px solid #cfd6df;
            padding: 8px;
          }
          th {
            background: #f3f4f6;
            text-align: left;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.4px;
          }
          .number {
            text-align: right;
            white-space: nowrap;
          }
          .desc {
            white-space: pre-wrap;
            line-height: 1.35;
          }
          .totals {
            margin-top: 16px;
            margin-left: auto;
            width: 280px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .totals-row.total {
            font-weight: 700;
            font-size: 14px;
            border-bottom: 2px solid #0f172a;
          }
          .description {
            margin-top: 2px;
            color: #111827;
            line-height: 1.4;
            white-space: pre-wrap;
            font-family: Verdana, Geneva, sans-serif;
            font-size: 10px;
            font-weight: 400;
            padding-left: 12px;
            text-indent: -12px;
          }
          .validity-note {
            margin: 0 0 8px 0;
            color: #111827;
            font-size: 12px;
            font-weight: 400;
          }
          .footer {
            position: fixed;
            left: 16px;
            right: 16px;
            bottom: 20px;
            padding-top: 8px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header-top">
          <div class="company">
            ${logoMarkup}
            <div class="company-line">19 Bis Avenue Aristide Briand</div>
            <div class="company-line">93190 LIVRY GARGAN</div>
            <div class="company-line">Tél: 01 43 02 00 96</div>
            <div class="company-line">Tél: 07 66 22 11 21</div>
            <div class="company-line">Site web: www.atlassign.fr</div>
            <div class="company-line">Email: contact@atlassign.fr</div>
          </div>
          <div class="document">
            <div class="document-badge">
              <div class="document-title">DEVIS</div>
            </div>
            <div class="client-window">
              <div class="client-line"><strong>${escapeHtml(quote.client.companyName)}</strong></div>
              <div class="client-line">${escapeHtml(clientAddress.line2)}</div>
              ${clientAddress.line3 ? `<div class="client-line">${escapeHtml(clientAddress.line3)}</div>` : ""}
            </div>
          </div>
        </div>

        <div class="content-separator"></div>

        <div class="quote-meta-box">
          <div class="title">Informations devis</div>
          <div class="quote-meta-grid">
            <div class="quote-meta-cell quote-meta-label">N° devis</div>
            <div class="quote-meta-cell quote-meta-label">Date</div>
            <div class="quote-meta-cell quote-meta-label">Mode de règlement</div>
            <div class="quote-meta-cell quote-meta-label">Référence</div>
            <div class="quote-meta-cell quote-meta-value">${escapeHtml(quote.quoteNumber)}</div>
            <div class="quote-meta-cell quote-meta-value">${formatDate(quote.date)}</div>
            <div class="quote-meta-cell quote-meta-value">${escapeHtml(paymentMethod)}</div>
            <div class="quote-meta-cell quote-meta-value">${escapeHtml(quote.reference)}</div>
          </div>
        </div>
        <div class="validity-note">Devis valable : 3 semaines</div>

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Qté</th>
              <th>Prix unitaire HT</th>
              <th>Total ligne HT</th>
            </tr>
          </thead>
          <tbody>
            ${items}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row"><span>Sous-total HT</span><span>${formatCurrency(quote.subtotalHT)}</span></div>
          <div class="totals-row"><span>Transport</span><span>${formatCurrency(quote.transport)}</span></div>
          <div class="totals-row total"><span>Total HT</span><span>${formatCurrency(quote.totalHT)}</span></div>
        </div>

        <div style="margin-top: 14px;">
          <div class="description">• Toutes nos enseignes sont fournis avec plan de pose à l'échelle1, fixations tiges filetées ( ou autre à définir ) , et alimentations 12v Meanwell IP67</div>
          <div class="description">• Délai sous 2 à 3 semaines après validation du BAT.</div>
          <div class="description">• Conditions de règlements Acompte de 50% pour validation solde à la livraison</div>
        </div>

        <div class="footer">
          Siret : 85242494400019 - RCS : IBAN FR46 3000 2011 3600 0007 1490 B34 - N° TVA intracom : FR18852424944
        </div>
      </body>
    </html>
  `;
}

export async function generateQuotePdf(quote: PdfQuote): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(buildHtml(quote), { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "16px",
        bottom: "20px",
        left: "16px",
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
