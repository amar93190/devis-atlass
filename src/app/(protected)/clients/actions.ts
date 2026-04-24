"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const clientSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  address: z.string().min(4),
});

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

  await prisma.client.create({ data: parsed.data });
  revalidatePath("/clients");
  revalidatePath("/quotes/new");
  redirect("/clients");
}
