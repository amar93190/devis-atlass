import { useState } from "react";
import styled from "styled-components";
import { IconChevronDown } from "@tabler/icons-react";
import { colors, spacing } from "@theme/index";

const Card = styled.div`
  border-radius: 20px;
  background: #ffffff;
  box-shadow: ${"0px 8px 24px rgba(0,0,0,0.1)"};
  overflow: hidden;
`;

const Header = styled.button<{ $open: boolean }>`
  width: 100%;
  border: none;
  background: linear-gradient(90deg, ${colors.mint} 0%, ${colors.teal} 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  padding: ${spacing.sm}px ${spacing.lg}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const Body = styled.ul<{ $open: boolean }>`
  list-style: none;
  margin: 0;
  padding: ${({ $open }) => ($open ? `${spacing.md}px ${spacing.lg}px` : "0")};
  max-height: ${({ $open }) => ($open ? "600px" : "0")};
  overflow: hidden;
  transition: all 0.3s ease;
  display: grid;
  gap: 12px;
`;

const Bullet = styled.li`
  font-size: 16px;
  line-height: 24px;
  color: #1b1b1b;
`;

export type PlanAccordionProps = {
  title: string;
  items: string[];
};

export const PlanAccordion = ({ title, items }: PlanAccordionProps) => {
  const [open, setOpen] = useState(true);

  return (
    <Card>
      <Header onClick={() => setOpen(prev => !prev)} $open={open} aria-expanded={open}>
        {title}
        <IconChevronDown
          size={22}
          stroke={2}
          style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: "transform 0.2s ease" }}
        />
      </Header>
      <Body $open={open}>
        {items.map(item => (
          <Bullet key={item}>- {item}</Bullet>
        ))}
      </Body>
    </Card>
  );
};
