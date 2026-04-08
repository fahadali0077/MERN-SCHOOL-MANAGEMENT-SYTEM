import React from 'react';
import styled, { keyframes, css } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const spinnerCss = css`
  &::after {
    content: '';
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ${spin} 0.7s linear infinite;
    margin-left: 8px;
    vertical-align: middle;
  }
`;

const variantStyles = {
  primary: css`
    background: var(--color-primary-600);
    color: #fff;
    border: 1.5px solid transparent;
    &:hover:not(:disabled) { background: var(--color-primary-700); }
    &:active:not(:disabled) { transform: scale(0.98); }
  `,
  secondary: css`
    background: var(--bg-card);
    color: var(--color-neutral-700);
    border: 1.5px solid var(--color-neutral-200);
    &:hover:not(:disabled) { background: var(--color-neutral-50); }
    &:active:not(:disabled) { transform: scale(0.98); }
  `,
  danger: css`
    background: var(--color-danger-600);
    color: #fff;
    border: 1.5px solid transparent;
    &:hover:not(:disabled) { background: var(--color-danger-700); }
    &:active:not(:disabled) { transform: scale(0.98); }
  `,
  ghost: css`
    background: transparent;
    color: var(--color-neutral-600);
    border: 1.5px solid transparent;
    &:hover:not(:disabled) { background: var(--color-neutral-100); color: var(--color-neutral-800); }
    &:active:not(:disabled) { transform: scale(0.98); }
  `,
  success: css`
    background: var(--color-success);
    color: #fff;
    border: 1.5px solid transparent;
    &:hover:not(:disabled) { background: var(--color-success-700); }
    &:active:not(:disabled) { transform: scale(0.98); }
  `,
};

const sizeStyles = {
  sm: css`
    height: 32px;
    padding: 0 12px;
    font-size: var(--text-xs);
    border-radius: var(--radius-md);
  `,
  md: css`
    height: 40px;
    padding: 0 16px;
    font-size: var(--text-sm);
    border-radius: var(--radius-md);
  `,
  lg: css`
    height: 44px;
    padding: 0 20px;
    font-size: var(--text-base);
    border-radius: var(--radius-md);
  `,
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1;
  cursor: pointer;
  transition: background var(--transition-base), transform var(--transition-fast), box-shadow var(--transition-base), opacity var(--transition-base);
  white-space: nowrap;
  user-select: none;
  min-width: 44px;

  ${props => sizeStyles[props.$size || 'md']}
  ${props => variantStyles[props.$variant || 'primary']}
  ${props => props.$fullWidth && 'width: 100%;'}
  ${props => props.$loading && spinnerCss}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  ...props
}) => (
  <StyledButton
    $variant={variant}
    $size={size}
    $loading={loading}
    $fullWidth={fullWidth}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? null : children}
  </StyledButton>
);

export default Button;

// Named exports for quick use
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
