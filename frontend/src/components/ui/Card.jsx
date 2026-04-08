import React from 'react';
import styled, { css } from 'styled-components';

const StyledCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base);

  ${props => props.$hoverable && css`
    cursor: pointer;
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  `}

  ${props => props.$accent && css`
    border-left: 3px solid ${props.$accent};
  `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
`;

const CardTitle = styled.h3`
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-neutral-800);
  line-height: 1.3;
`;

const CardSubtitle = styled.p`
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  margin-top: 4px;
`;

const CardBody = styled.div`
  padding: ${props => props.$noPadding ? '0' : '24px'};
`;

const CardFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid var(--color-neutral-100);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

const Card = ({ children, hoverable, accent, style, className, ...props }) => (
  <StyledCard $hoverable={hoverable} $accent={accent} style={style} className={className} {...props}>
    {children}
  </StyledCard>
);

Card.Header = ({ children, action }) => (
  <CardHeader>
    <div>{children}</div>
    {action && <div>{action}</div>}
  </CardHeader>
);

Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
