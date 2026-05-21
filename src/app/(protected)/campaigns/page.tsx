import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function CampaignsPage() {
  await requireAuth();

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      recipients: true,
      createdBy: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Campagnes email</h2>
        <Link
          href="/campaigns/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Nouvelle campagne
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Aucune campagne envoyée pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const sent = campaign.recipients.filter((r) => r.status === "SENT").length;
            const failed = campaign.recipients.filter((r) => r.status === "FAILED").length;
            const total = campaign.recipients.length;

            return (
              <div key={campaign.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{campaign.subject}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(campaign.createdAt)} · par {campaign.createdBy.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm shrink-0">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700 font-medium">
                      {sent} envoyé{sent > 1 ? "s" : ""}
                    </span>
                    {failed > 0 && (
                      <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-rose-700 font-medium">
                        {failed} échoué{failed > 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="text-slate-400">{total} destinataire{total > 1 ? "s" : ""}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 line-clamp-2 whitespace-pre-wrap">
                  {campaign.body}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
