import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateDepositRequestPdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const dr = await prisma.depositRequest.findUnique({
    where: { id },
    include: { quote: { include: { client: true } } },
  });

  if (!dr) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const pdfBuffer = await generateDepositRequestPdf({
    number: dr.number,
    date: dr.createdAt,
    paymentMethod: dr.paymentMethod,
    description: dr.description,
    amountHT: Number(dr.amountHT),
    client: {
      companyName: dr.quote.client.companyName,
      address: dr.quote.client.address,
    },
  });

  return new NextResponse(pdfBuffer as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${dr.number}.pdf"`,
    },
  });
}
