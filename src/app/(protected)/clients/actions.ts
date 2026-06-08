"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import * as xlsx from "xlsx";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const clientSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  address: z.string().min(4),
});

export async function updateClientAction(formData: FormData) {
  await requireAuth();

  const id = formData.get("id") as string;
  if (!id) redirect("/clients");

  const parsed = clientSchema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    redirect(`/clients/${id}/edit?error=invalid-client`);
  }

  await prisma.client.update({ where: { id }, data: parsed.data });
  revalidatePath("/clients");
  revalidatePath("/quotes/new");
  redirect("/clients");
}

export async function createClientAction(formData: FormData) {
  await requireAuth();

  const parsed = clientSchema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    redirect("/clients/new?error=invalid-client");
  }

  await prisma.client.create({ data: { ...parsed.data, source: "MANUAL" } });
  revalidatePath("/clients");
  revalidatePath("/quotes/new");
  redirect("/clients");
}

export async function deleteClientAction(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") || "");
  const tab = formData.get("tab") === "imported" ? "imported" : "manual";
  const clientsPath = tab === "imported" ? "/clients?tab=imported" : "/clients";

  if (!id) redirect(`${clientsPath}${tab === "imported" ? "&" : "?"}error=missing-client`);

  const quoteCount = await prisma.quote.count({ where: { clientId: id } });
  if (quoteCount > 0) {
    redirect(`${clientsPath}${tab === "imported" ? "&" : "?"}error=client-has-quotes`);
  }

  await prisma.client.delete({ where: { id } });

  revalidatePath("/clients");
  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
  revalidatePath("/quotes/new");
  redirect(`${clientsPath}${tab === "imported" ? "&" : "?"}deleted=1`);
}

const rowSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().default(""),
  address: z.string().default(""),
});

function normalizeRow(row: Record<string, unknown>) {
  const get = (...keys: string[]) => {
    for (const key of keys) {
      const found = Object.keys(row).find((k) => k.trim().toLowerCase() === key.toLowerCase());
      if (found && row[found] !== undefined && row[found] !== null) {
        return String(row[found]).trim();
      }
    }
    return "";
  };

  return {
    companyName: get("entreprise", "company", "société", "societe", "nom entreprise"),
    contactName: get("contact", "nom", "prénom nom", "prenom nom", "name", "interlocuteur"),
    email: get("email", "e-mail", "mail", "courriel"),
    phone: get("téléphone", "telephone", "tel", "tél", "phone"),
    address: get("adresse", "address"),
  };
}

export async function importClientsAction(formData: FormData) {
  await requireAuth();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    redirect("/clients/import?error=no-file");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet);

  if (rows.length === 0) {
    redirect("/clients/import?error=empty-file");
  }

  let imported = 0;
  let skipped = 0;

  for (const raw of rows) {
    const normalized = normalizeRow(raw);
    const parsed = rowSchema.safeParse(normalized);
    if (!parsed.success) { skipped++; continue; }

    const existing = await prisma.client.findUnique({ where: { email: parsed.data.email } });
    if (existing) { skipped++; continue; }

    await prisma.client.create({
      data: { ...parsed.data, source: "IMPORTED" },
    });
    imported++;
  }

  revalidatePath("/clients");
  redirect(`/clients?tab=imported&imported=${imported}&skipped=${skipped}`);
}
