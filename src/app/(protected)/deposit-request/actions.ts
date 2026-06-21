"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function buildNumber(existing: string[]): string {
  const max = existing.reduce((acc, n) => {
    const match = n.match(/^FD(\d+)$/);
    if (!match) return acc;
    const val = Number(match[1]);
    return Number.isFinite(val) ? Math.max(acc, val) : acc;
  }, 22131);
  return `FD${String(max + 1)}`;
}

export async function createDepositRequestAction(formData: FormData) {
  const user = await requireAuth();

  const quoteId = String(formData.get("quoteId") || "");
  const description = String(formData.get("description") || "").trim();
  const amountHT = Math.max(0, Number(String(formData.get("amountHT") || "0").replace(",", ".")));
  const paymentMethod = String(formData.get("paymentMethod") || "Virement SEPA").trim();

  if (!quoteId || !description || !amountHT) {
    redirect("/deposit-request/new?error=invalid");
  }

  const existing = await prisma.depositRequest.findMany({ select: { number: true } });
  const number = buildNumber(existing.map((d) => d.number));

  await prisma.depositRequest.create({
    data: { number, quoteId, description, amountHT, paymentMethod, createdById: user.id },
  });

  revalidatePath("/deposit-request");
  redirect("/deposit-request");
}

export async function deleteDepositRequestAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") || "");
  if (!id) redirect("/deposit-request");

  await prisma.depositRequest.delete({ where: { id } });

  revalidatePath("/deposit-request");
  redirect("/deposit-request");
}
