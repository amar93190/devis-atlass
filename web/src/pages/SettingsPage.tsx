import styled from "styled-components";
import { GradientHeading } from "@components/GradientHeading";
import { spacing } from "@theme/index";

const Card = styled.div`
  margin-top: ${spacing.lg}px;
  padding: ${spacing.lg}px;
  border-radius: 24px;
  background: #f6faf9;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

export const SettingsPage = () => (
  <div>
    <GradientHeading>Paramètres</GradientHeading>
    <Card>TODO: gestion du profil, langue, mode GPT-4.</Card>
  </div>
);
