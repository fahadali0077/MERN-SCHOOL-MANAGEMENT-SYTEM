import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/* ──────────────────────────────────────────────────
   Layout shell
────────────────────────────────────────────────── */
const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
`;

/* Push main content right by sidebar width */
const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  /* desktop — sidebar 240px */
  margin-left: var(--sidebar-width);
  transition: margin-left 200ms cubic-bezier(0.4, 0, 0.2, 1);

  /* tablet — sidebar collapses to 64px icon-only */
  @media (max-width: 1024px) and (min-width: 641px) {
    margin-left: var(--sidebar-collapsed-width);
  }

  /* mobile — sidebar is overlay, no margin shift */
  @media (max-width: 640px) {
    margin-left: 0;
  }
`;

const pageEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Main = styled.main`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 28px 28px 48px;
  animation: ${pageEnter} 200ms ease-out both;

  @media (max-width: 768px) {
    padding: 20px 16px 40px;
  }

  @media (max-width: 640px) {
    padding: 16px 12px 32px;
  }
`;

/* ──────────────────────────────────────────────────
   DashboardLayout component
────────────────────────────────────────────────── */
const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  /* re-key children on route change to trigger enter animation */
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, []);

  return (
    <Shell>
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <ContentWrapper>
        <Topbar onMobileMenuOpen={() => setMobileOpen(true)} />
        <Main id="main-content" key={animKey}>
          {children}
        </Main>
      </ContentWrapper>
    </Shell>
  );
};

export default DashboardLayout;
