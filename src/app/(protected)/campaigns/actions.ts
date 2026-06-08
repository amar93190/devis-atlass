"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getResend, FROM_EMAIL } from "@/lib/resend";

const EMAIL_FOOTER = `Bonne réception

Votre Contact
JDAINI.K
Responsable Commercial
Ligne direct +33 7 66 22 11 21
contact@atlassign.fr

www.atlassign.fr
Bureau:+33 1 43 02 00 96`;

function applyVariables(text: string, client: { contactName: string; companyName: string }): string {
  const prenom = client.contactName.split(" ")[0];
  return text
    .replaceAll("{{prénom}}", prenom)
    .replaceAll("{{nom}}", client.contactName)
    .replaceAll("{{entreprise}}", client.companyName);
}

export async function sendCampaignAction(formData: FormData) {
  const user = await requireAuth();

  const subject = (formData.get("subject") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const clientIds = formData.getAll("clientIds") as string[];

  if (!subject || !body || clientIds.length === 0) {
    redirect("/campaigns/new?error=invalid-form");
  }

  const clients = await prisma.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, email: true, contactName: true, companyName: true },
  });

  const campaign = await prisma.campaign.create({
    data: { subject, body, createdById: user.id },
  });

  for (const client of clients) {
    let status: "SENT" | "FAILED" = "FAILED";

    const personalizedBody = applyVariables(body, client);
    const personalizedSubject = applyVariables(subject, client);
    const emailText = `${personalizedBody}\n\n${EMAIL_FOOTER}`;

    try {
      const { data, error } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: client.email,
        subject: personalizedSubject,
        text: emailText,
      });

      if (error) {
        console.error(`[Resend] Échec pour ${client.email}:`, error);
      } else {
        console.log(`[Resend] Envoyé à ${client.email}, id: ${data?.id}`);
        status = "SENT";
      }
    } catch (err) {
      console.error(`[Resend] Exception pour ${client.email}:`, err);
      status = "FAILED";
    }

    await prisma.campaignRecipient.create({
      data: { campaignId: campaign.id, clientId: client.id, status },
    });
  }

  revalidatePath("/campaigns");
  redirect("/campaigns");
}

export async function deleteCampaignAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") || "");
  if (!id) redirect("/campaigns?error=missing-id");

  await prisma.campaign.delete({ where: { id } });

  revalidatePath("/campaigns");
  redirect("/campaigns");
}
