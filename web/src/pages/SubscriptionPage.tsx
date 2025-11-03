import styled from "styled-components";
import { GradientHeading } from "@components/GradientHeading";
import { spacing, colors } from "@theme/index";

const Plans = styled.div`
  margin-top: ${spacing.lg}px;
  display: grid;
  gap: ${spacing.md}px;
`;

const Card = styled.div<{ $active?: boolean }>`
  padding: ${spacing.lg}px;
  border-radius: 24px;
  border: 2px solid ${({ $active }) => ($active ? colors.mint : "transparent")};
  background: ${({ $active }) => ($active ? "#e9f8f2" : "#f6faf9")};
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 24px;
`;

const Body = styled.p`
  margin: 0;
  color: ${colors.greyText};
`;

const plans = [
  { tier: "freemium", title: "Freemium", requests: "20 requêtes/mois", price: "Gratuit", model: "GPT-3.5 (démo)" },
  { tier: "basic", title: "Basic", requests: "50 requêtes/mois", price: "À venir", model: "GPT-3.5" },
  { tier: "pro", title: "Pro", requests: "200 requêtes/mois", price: "À venir", model: "GPT-4 optionnel" },
  { tier: "elite", title: "Elite", requests: "500 requêtes/mois", price: "À venir", model: "GPT-4" }
] as const;

export const SubscriptionPage = () => {
  return (
    <div>
      <GradientHeading>Abonnements</GradientHeading>
      <p style={{ color: colors.greyText }}>
        Cette démo présente uniquement le palier <strong>Freemium</strong>. Les formules payantes seront activées
        prochainement.
      </p>
      <Plans>
        {plans.map(plan => (
          <Card key={plan.tier} $active={plan.tier === "freemium"}>
            <Title>{plan.title}</Title>
            <Body>{plan.price}</Body>
            <Body>{plan.requests}</Body>
            <Body>Modèle : {plan.model}</Body>
          </Card>
        ))}
      </Plans>
    </div>
  );
};
