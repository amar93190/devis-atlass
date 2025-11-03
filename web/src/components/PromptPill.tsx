import styled from "styled-components";
import { colors, spacing } from "@theme/index";
import { typography } from "@theme/typography";
import { shadows } from "@theme/shadows";

const Pill = styled.button<{ $active?: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 10px 24px;
  background: #ffffff;
  color: ${colors.greyText};
  font-size: 14px;
  line-height: 18px;
  font-family: inherit;
  cursor: pointer;
  box-shadow: ${shadows.card};
  border: ${({ $active }) => ($active ? `2px solid ${colors.mint}` : "1px solid rgba(0, 0, 0, 0.04)")};
  transition: border-color 0.15s ease, transform 0.15s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

export type PromptPillProps = {
  label: string;
  onClick?: () => void;
  active?: boolean;
};

export const PromptPill = ({ label, onClick, active }: PromptPillProps) => (
  <Pill type="button" onClick={onClick} aria-label={label} $active={active}>
    {label}
  </Pill>
);
