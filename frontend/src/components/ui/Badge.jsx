import React from 'react';
import styled, { css } from 'styled-components';

const variantStyles = {
  success: css`
    background: var(--color-success-50);
    color: var(--color-success-700);
    border: 1px solid var(--color-success-100);
  `,
  danger: css`
    background: var(--color-danger-50);
    color: var(--color-danger-600);
    border: 1px solid var(--color-danger-100);
  `,
  warning: css`
    background: var(--color-warning-50);
    color: var(--color-warning-700);
    border: 1px solid var(--color-warning-100);
  `,
  info: css`
    background: var(--color-info-50);
    color: var(--color-info-700);
    border: 1px solid var(--color-info-100);
  `,
  primary: css`
    background: var(--color-primary-50);
    color: var(--color-primary-700);
    border: 1px solid var(--color-primary-100);
  `,
  neutral: css`
    background: var(--color-neutral-100);
    color: var(--color-neutral-600);
    border: 1px solid var(--color-neutral-200);
  `,
  admin: css`
    background: var(--color-info-50);
    color: var(--color-info-700);
    border: 1px solid var(--color-info-100);
  `,
  teacher: css`
    background: var(--color-primary-50);
    color: var(--color-primary-700);
    border: 1px solid var(--color-primary-100);
  `,
  student: css`
    background: var(--color-success-50);
    color: var(--color-success-700);
    border: 1px solid var(--color-success-100);
  `,
};

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.01em;
  white-space: nowrap;

  ${props => variantStyles[props.$variant || 'neutral']}
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
`;

const Badge = ({ children, variant = 'neutral', dot = false, ...props }) => (
  <StyledBadge $variant={variant} {...props}>
    {dot && <Dot />}
    {children}
  </StyledBadge>
);

export default Badge;

// Role-specific badges
export const AdminBadge = () => <Badge variant="admin">Admin</Badge>;
export const TeacherBadge = () => <Badge variant="teacher">Teacher</Badge>;
export const StudentBadge = () => <Badge variant="student">Student</Badge>;

// Status badges
export const PresentBadge = () => <Badge variant="success" dot>Present</Badge>;
export const AbsentBadge = () => <Badge variant="danger" dot>Absent</Badge>;
export const PendingBadge = () => <Badge variant="warning" dot>Pending</Badge>;
export const ResolvedBadge = () => <Badge variant="success" dot>Resolved</Badge>;
