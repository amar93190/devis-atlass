import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { colors } from "@theme/index";
import { IconFolder, IconMessageCircle, IconPlus, IconUser } from "@tabler/icons-react";

const Wrapper = styled.div`
  width: 100%;
  padding: 0 40px;
  box-sizing: border-box;
  margin-bottom: 56px;

  @media (max-width: 1024px) {
    padding: 0 32px;
    margin-bottom: 40px;
  }

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

const Bar = styled.header`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  width: 100%;
`;

const LogoLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0px 12px 20px rgba(13, 61, 74, 0.06);
  justify-self: flex-start;
`;

const LogoImage = styled.img`
  width: 70%;
  height: 70%;
  object-fit: contain;
`;

const ActionsGroup = styled.nav`
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 12px 28px;
  border-radius: 999px;
  background: rgba(244, 249, 247, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0px 10px 24px rgba(13, 61, 74, 0.08);
  justify-self: center;
  margin: 0 auto;
`;

const ActionButton = styled(Link)<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: ${({ $active }) => ($active ? colors.mint : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : colors.mint)};
  border: 1px solid ${({ $active }) => ($active ? colors.mint : "rgba(0,0,0,0.08)")};
  box-shadow: ${({ $active }) => ($active ? "0px 12px 22px rgba(134, 209, 179, 0.35)" : "0px 6px 14px rgba(13, 61, 74, 0.06)")};
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0px 12px 22px rgba(134, 209, 179, 0.28);
  }
`;

const ProfileButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(180deg, ${colors.mint} 0%, ${colors.teal} 100%);
  cursor: pointer;
  box-shadow: 0px 12px 24px rgba(13, 61, 74, 0.12);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  justify-self: flex-end;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0px 14px 26px rgba(13, 61, 74, 0.16);
  }
`;

const actions = [
  { id: "create", icon: IconPlus, to: "/chat", label: "Créer un plan" },
  { id: "chat", icon: IconMessageCircle, to: "/chat", label: "Chat" },
  { id: "files", icon: IconFolder, to: "/dashboard", label: "Tableau de bord" }
];

export const TopBar = () => {
  const { pathname } = useLocation();

  return (
    <Wrapper>
      <Bar>
        <LogoLink to="/chat" aria-label="Accueil Diego">
          <LogoImage src="/logo.svg" alt="Diego" />
        </LogoLink>
        <ActionsGroup aria-label="Navigation principale">
          {actions.map(action => {
            const Icon = action.icon;
            const active = pathname.startsWith(action.to);
            return (
              <ActionButton key={action.id} to={action.to} aria-label={action.label} $active={active}>
                <Icon size={22} stroke={1.8} />
              </ActionButton>
            );
          })}
        </ActionsGroup>
        <ProfileButton aria-label="Profil utilisateur">
          <IconUser size={24} color="#ffffff" stroke={1.8} />
        </ProfileButton>
      </Bar>
    </Wrapper>
  );
};
