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

function buildHtml(quote: PdfQuote) {
  const logoMarkup = logoDataUri
    ? `<img src="${logoDataUri}" alt="Atlas Sign" class="company-logo" />`
    : `<div class="logo-fallback">ATLAS SIGN</div>`;

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
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .company {
            max-width: 62%;
          }
          .company-logo {
            width: 120px;
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
          .document-title {
            font-size: 34px;
            letter-spacing: 1px;
            font-weight: 800;
            color: #0f172a;
          }
          .document-meta {
            margin-top: 6px;
            color: #374151;
            line-height: 1.4;
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
          .client-table {
            width: 62%;
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 11px;
          }
          .client-table th {
            width: 130px;
            background: #f8fafc;
            font-size: 10px;
            padding: 6px;
          }
          .client-table td {
            font-size: 11px;
            padding: 6px;
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
          }
          .footer {
            margin-top: 28px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 10px;
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
            <div class="company-line">Tél portable: 07 66 22 11 21</div>
            <div class="company-line">Site web: www.atlassign.fr</div>
            <div class="company-line">Email: contact@atlassign.fr</div>
          </div>
          <div class="document">
            <div class="document-title">DEVIS</div>
            <div class="document-meta"><strong>N°:</strong> ${escapeHtml(quote.quoteNumber)}</div>
            <div class="document-meta"><strong>Date:</strong> ${formatDate(quote.date)}</div>
            <div class="document-meta"><strong>Réf:</strong> ${escapeHtml(quote.reference)}</div>
          </div>
        </div>

        <table class="client-table">
          <tr>
            <th>Client</th>
            <td><strong>${escapeHtml(quote.client.companyName)}</strong></td>
          </tr>
          <tr>
            <th>Contact</th>
            <td>${escapeHtml(quote.client.contactName)}</td>
          </tr>
          <tr>
            <th>Email / Téléphone</th>
            <td>${escapeHtml(quote.client.email)} - ${escapeHtml(quote.client.phone)}</td>
          </tr>
          <tr>
            <th>Adresse</th>
            <td>${escapeHtml(quote.client.address)}</td>
          </tr>
        </table>

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
          <div class="description">Toutes nos enseignes sont fournis avec plan de pose à l'échelle1, fixations tiges filetées ( ou autre à définir ) , et alimentations 12v Meanwell IP67</div>
          <div class="description">Délai sous 2 à 3 semaines après validation du BAT.</div>
          <div class="description">Conditions de règlements Acompte de 50% pour validation solde à la livraison</div>
          <div class="description">Les frais de port indiqués sur ce devis sont donnés à titre indicatif et peuvent évoluer selon les tarifs appliqués par DHL ou autres au moment de l’expédition indépendamment de notre volonté.</div>
          <div class="description">(délai de livraison estimé est de 3 à 7 jours ouvrables )</div>
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
