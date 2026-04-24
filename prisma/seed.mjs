import bcrypt from "bcryptjs";
import { PrismaClient, QuoteStatus } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const toMoney = (value) => Number(value.toFixed(2));

function resolveSeedPassword(envName, label) {
  const fromEnv = process.env[envName];
  if (fromEnv && fromEnv.length >= 12) {
    return fromEnv;
  }

  const generated = `Tmp-${randomUUID().replaceAll("-", "").slice(0, 18)}!`;
  console.warn(
    `[seed] ${envName} absent: mot de passe temporaire généré pour ${label}: ${generated}`,
  );
  return generated;
}

async function main() {
  const accountSeeds = [
    {
      name: "Support",
      email: "support@atlassign.fr",
      password: resolveSeedPassword("SEED_SUPPORT_PASSWORD", "Support"),
    },
    {
      name: "Gerant",
      email: "gerant@atlassign.fr",
      password: resolveSeedPassword("SEED_GERANT_PASSWORD", "Gerant"),
    },
    {
      name: "Commercial",
      email: "commercial@atlassign.fr",
      password: resolveSeedPassword("SEED_COMMERCIAL_PASSWORD", "Commercial"),
    },
  ];

  const users = {};
  for (const account of accountSeeds) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        passwordHash,
      },
      create: {
        name: account.name,
        email: account.email,
        passwordHash,
      },
    });
    users[account.email] = user;
  }

  const gerant = users["gerant@atlassign.fr"];

  const clientData = [
    {
      companyName: "Atelier Horizon",
      contactName: "Camille Bernard",
      email: "camille@atelier-horizon.fr",
      phone: "06 12 34 56 78",
      address: "12 rue des Forges, 75011 Paris",
    },
    {
      companyName: "Maison Rive Gauche",
      contactName: "Nicolas Petit",
      email: "nicolas@rive-gauche.fr",
      phone: "06 98 76 54 32",
      address: "4 place de la République, 69002 Lyon",
    },
    {
      companyName: "Studio Voltaire",
      contactName: "Sophie Martin",
      email: "sophie@studio-voltaire.fr",
      phone: "07 11 22 33 44",
      address: "22 boulevard Voltaire, 33000 Bordeaux",
    },
  ];

  const clients = [];
  for (const data of clientData) {
    const client = await prisma.client.upsert({
      where: { email: data.email },
      update: data,
      create: data,
    });
    clients.push(client);
  }

  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();

  const quotesToCreate = [
    {
      quoteNumber: "DEV-2026-0001",
      client: clients[0],
      date: new Date("2026-03-10"),
      reference: "REF-HZN-01",
      description: "Conception et fabrication mobilier sur mesure",
      transport: 120,
      productionDelay: "3 semaines",
      transportDelay: "5 jours",
      status: QuoteStatus.DRAFT,
      notes: "Client prioritaire",
      items: [
        {
          code: "PRO 100",
          description:
            "Réalisation d'un ensemble de lettres et logo en rétro-éclairage.",
          quantity: 2,
          unitPrice: 640,
        },
        {
          code: "LIVRAISON",
          description:
            "Emballage, mise en caisse en bois sur mesure et livraison atelier.",
          quantity: 1,
          unitPrice: 210,
        },
      ],
    },
    {
      quoteNumber: "DEV-2026-0002",
      client: clients[1],
      date: new Date("2026-03-13"),
      reference: "REF-MRG-18",
      description: "Agencement boutique gamme premium",
      transport: 180,
      productionDelay: "4 semaines",
      transportDelay: "7 jours",
      status: QuoteStatus.SENT,
      notes: "En attente de validation budget",
      items: [
        {
          code: "PRO 200",
          description: "Réalisation de lettres diffusantes éclairage LED neutre blanc.",
          quantity: 1,
          unitPrice: 1200,
        },
        {
          code: "EQUIPEMENT",
          description: "",
          quantity: 6,
          unitPrice: 340,
        },
      ],
    },
    {
      quoteNumber: "DEV-2026-0003",
      client: clients[2],
      date: new Date("2026-03-18"),
      reference: "REF-STV-03",
      description: "Fabrication série courte éléments décoratifs",
      transport: 90,
      productionDelay: "2 semaines",
      transportDelay: "3 jours",
      status: QuoteStatus.VALIDATED,
      notes: "Acompte reçu",
      items: [
        {
          code: "PRO 600",
          description:
            "Néon flex blanc 8 mm sur plaque incolore 6 mm selon votre fichier.",
          quantity: 10,
          unitPrice: 95,
        },
        {
          code: "DIVERS",
          description: "",
          quantity: 10,
          unitPrice: 8,
        },
      ],
    },
  ];

  for (const quote of quotesToCreate) {
    const itemRows = quote.items.map((item) => {
      const total = toMoney(item.quantity * item.unitPrice);
      return { ...item, total };
    });

    const subtotal = toMoney(itemRows.reduce((sum, row) => sum + row.total, 0));
    const totalHT = toMoney(subtotal + quote.transport);

    await prisma.quote.create({
      data: {
        quoteNumber: quote.quoteNumber,
        clientId: quote.client.id,
        date: quote.date,
        reference: quote.reference,
        description: quote.description,
        quantity: quote.items[0]?.quantity ?? 0,
        unitPrice: quote.items[0]?.unitPrice ?? 0,
        transport: quote.transport,
        subtotalHT: subtotal,
        totalHT,
        productionDelay: quote.productionDelay,
        transportDelay: quote.transportDelay,
        status: quote.status,
        notes: quote.notes,
        createdById: gerant.id,
        items: {
          create: itemRows.map((row) => ({
            label: row.code,
            description: row.description || null,
            quantity: row.quantity,
            unitPrice: row.unitPrice,
            total: row.total,
          })),
        },
      },
    });
  }

  console.log("Seed complete.");
  console.log("Identifiants de démonstration:");
  for (const account of accountSeeds) {
    console.log(`${account.email} / ${account.password}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
