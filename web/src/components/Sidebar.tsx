import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { IconPlus, IconMessageCircle, IconFolder } from "@tabler/icons-react";
import { colors, spacing } from "@theme/index";

export const SIDEBAR_WIDTH = 64;

const Wrapper = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;
  width: ${SIDEBAR_WIDTH}px;
  background: #f4faf7;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px ${spacing.xs / 2}px;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.04);
`;

const LogoButton = styled(Link)`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing.lg}px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const LogoImage = styled.img`
  width: 80%;
  height: 80%;
  object-fit: contain;
`;

const Actions = styled.div`
  display: grid;
  gap: 18px;
`;

const ActionButton = styled(Link)<{ $active?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active }) => ($active ? colors.mint : "#ffffff")};
  border: 1px solid ${({ $active }) => ($active ? colors.mint : "rgba(0,0,0,0.06)")};
  box-shadow: ${({ $active }) => ($active ? "0px 10px 20px rgba(134, 209, 179, 0.32)" : "0 6px 12px rgba(13, 61, 74, 0.06)")};
  color: ${({ $active }) => ($active ? "#ffffff" : colors.mint)};
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0px 10px 24px rgba(134, 209, 179, 0.28);
  }
`;

const icons = {
  chat: IconMessageCircle,
  create: IconPlus,
  files: IconFolder
};

export const Sidebar = () => {
  const { pathname } = useLocation();

  const items = useMemo(
    () => [
      { id: "create", label: "Nouveau plan", to: "/chat" },
      { id: "chat", label: "Chat", to: "/chat" },
      { id: "files", label: "Tableau de bord", to: "/dashboard" }
    ],
    []
  );

  return (
    <Wrapper>
      <LogoButton to="/chat" aria-label="Accueil Diego">
        <LogoImage src="/logo.svg" alt="Logo Diego" />
      </LogoButton>
      <Actions>
        {items.map(item => {
          const Icon = icons[item.id as keyof typeof icons] ?? IconMessageCircle;
          const active = pathname.startsWith(item.to);
          return (
            <ActionButton key={item.id} to={item.to} $active={active} aria-label={item.label}>
              <Icon size={20} stroke={1.6} />
            </ActionButton>
          );
        })}
      </Actions>
      <div style={{ flex: 1 }} />
    </Wrapper>
  );
};
