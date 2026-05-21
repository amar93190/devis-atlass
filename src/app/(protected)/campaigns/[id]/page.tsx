import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { deleteCampaignAction } from "@/app/(protected)/campaigns/actions";

type CampaignDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  await requireAuth();
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      recipients: {
        include: { client: { select: { companyName: true, contactName: true, email: true } } },
        orderBy: { sentAt: "asc" },
      },
    },
  });

  if (!campaign) notFound();

  const sent = campaign.recipients.filter((r) => r.status === "SENT").length;
  const failed = campaign.recipients.filter((r) => r.status === "FAILED").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{campaign.subject}</h2>
          <p className="text-sm text-slate-500">
            {formatDate(campaign.createdAt)} · par {campaign.createdBy.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={deleteCampaignAction}>
            <input type="hidden" name="id" value={campaign.id} />
            <button
              type="submit"
              className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              Supprimer
            </button>
          </form>
          <Link
            href="/campaigns"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Retour
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700 font-medium">
            {sent} envoyé{sent > 1 ? "s" : ""}
          </span>
          {failed > 0 && (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-rose-700 font-medium">
              {failed} échoué{failed > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-slate-400">{campaign.recipients.length} destinataire{campaign.recipients.length > 1 ? "s" : ""}</span>
        </div>
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Message envoyé</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{campaign.body}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Destinataires</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Entreprise</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {campaign.recipients.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{r.client.companyName}</td>
                <td className="px-4 py-3 text-slate-600">{r.client.contactName}</td>
                <td className="px-4 py-3 text-slate-600">{r.client.email}</td>
                <td className="px-4 py-3">
                  {r.status === "SENT" ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700 font-medium">Envoyé</span>
                  ) : (
                    <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-rose-700 font-medium">Échoué</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
