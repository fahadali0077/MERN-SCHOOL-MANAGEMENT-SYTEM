import React from 'react';
import styled from 'styled-components';

const HeaderRoot = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Title = styled.h1`
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-neutral-900);
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  line-height: 1.5;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const ActionArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
`;

const PageHeader = ({ title, subtitle, meta, actions, children }) => (
  <HeaderRoot>
    <TitleGroup>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      {meta && <Meta>{meta}</Meta>}
      {children}
    </TitleGroup>
    {actions && <ActionArea>{actions}</ActionArea>}
  </HeaderRoot>
);

export default PageHeader;
