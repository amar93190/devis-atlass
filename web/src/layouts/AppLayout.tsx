import { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { TopBar } from "@components/TopBar";

const Layout = styled.div`
  min-height: 100vh;
  background: #ffffff;
  color: #0d3d4a;
`;

const Main = styled.main`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 0 80px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(246, 250, 249, 0.7) 0%, rgba(255, 255, 255, 0.6) 260px, #ffffff 420px);

  @media (max-width: 1024px) {
    padding: 28px 0 64px;
    background: #ffffff;
  }
`;

const Inner = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 32px;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 0 24px;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

export const AppLayout = ({ children }: PropsWithChildren) => (
  <Layout>
    <Main>
      <TopBar />
      <Inner>{children ?? <Outlet />}</Inner>
    </Main>
  </Layout>
);
