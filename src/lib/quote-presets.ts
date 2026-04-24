export type QuoteCodePreset = {
  code: string;
  label: string;
  description: string;
};

export const QUOTE_CODE_PRESETS: QuoteCodePreset[] = [
  {
    code: "PRO 100",
    label: "Ref. / PRO 100",
    description:
      "Réalisation d'un ensemble de lettres et logo. Texte se lisant \"NOM DE L'ENSEIGNE PAR EXEMPLE\" en rétro-éclairage 2/3 (20mm). Face et chant opaque laqué RAL 5022 et 1/3 (10mm) arrière lumineux blanc 6500K pour le format 000 x 000mm.",
  },
  {
    code: "PRO 200",
    label: "Ref. / PRO 200",
    description:
      "Réalisation de lettres, texte se lisant \"NOM DE L'ENSEIGNE PAR EXEMPLE\". Face avant diffusante adhésivée bleu et neutre, éclairage LEDs neutre blanc 6500K, chant opaque épaisseur 40mm laqué RAL 9010, dimension selon votre fichier hors tout: 000 x 000mm.",
  },
  {
    code: "PRO 600",
    label: "Ref. / PRO 600",
    description:
      "Néon Flex / Réalisation d'un néon flex blanc de 8 mm de diamètre selon votre fichier, sur une plaque incolore de 6 mm. Les dimensions totales sont de 000 x 000 mm.",
  },
  {
    code: "LIVRAISON",
    label: "Ref. / Livraison",
    description:
      "Estimation des frais pour l'emballage et mise en caisse en bois sur mesure et livraison directement à votre atelier.",
  },
  {
    code: "EQUIPEMENT",
    label: "Ref. / Equipement (vierge)",
    description: "",
  },
  {
    code: "DIVERS",
    label: "Ref. / Divers (vierge)",
    description: "",
  },
  {
    code: "PRO 600 VIERGE 1",
    label: "Ref. / PRO 600 (vierge 1)",
    description: "",
  },
  {
    code: "PRO 600 VIERGE 2",
    label: "Ref. / PRO 600 (vierge 2)",
    description: "",
  },
];

const presetMap = new Map(
  QUOTE_CODE_PRESETS.map((preset) => [preset.code, preset]),
);

export function getQuoteCodeDescription(code: string): string {
  return presetMap.get(code)?.description ?? "";
}

export function isKnownQuoteCode(code: string): boolean {
  return presetMap.has(code);
}
