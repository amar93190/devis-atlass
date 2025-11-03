import styled from "styled-components";
import { GradientHeading } from "@components/GradientHeading";
import { spacing } from "@theme/index";

const Placeholder = styled.div`
  padding: ${spacing.lg}px;
  border-radius: 24px;
  background: #f6faf9;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

export const DashboardPage = () => (
  <div>
    <GradientHeading>Tableau de bord</GradientHeading>
    <Placeholder>TODO: stats, Stadioss TV, graphiques.</Placeholder>
  </div>
);
