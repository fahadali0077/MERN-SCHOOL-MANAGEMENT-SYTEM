import React from 'react';
import styled, { css } from 'styled-components';

/* ── deterministic color from name string ── */
const PALETTE = [
  ['#dbeafe', '#1d4ed8'], // blue
  ['#ede9fe', '#6d28d9'], // violet
  ['#fce7f3', '#be185d'], // pink
  ['#d1fae5', '#065f46'], // emerald
  ['#fef3c7', '#92400e'], // amber
  ['#ffedd5', '#9a3412'], // orange
  ['#e0f2fe', '#0369a1'], // sky
  ['#f3e8ff', '#7e22ce'], // purple
];

const colorFromName = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const initials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

/* ── size map ── */
const sizeMap = {
  xs: css` width: 24px; height: 24px; font-size: 10px; `,
  sm: css` width: 32px; height: 32px; font-size: 12px; `,
  md: css` width: 40px; height: 40px; font-size: 14px; `,
  lg: css` width: 48px; height: 48px; font-size: 18px; `,
  xl: css` width: 64px; height: 64px; font-size: 24px; `,
  '2xl': css` width: 80px; height: 80px; font-size: 30px; `,
};

const StyledAvatar = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.01em;
  user-select: none;
  line-height: 1;
  background-color: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  ${({ $size }) => sizeMap[$size] ?? sizeMap.md}

  ${({ $ring }) =>
    $ring &&
    css`
      box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 4px var(--color-primary-500);
    `}
`;

const Avatar = ({ name = '', size = 'md', ring = false, style, className }) => {
  const [bg, fg] = colorFromName(name);
  return (
    <StyledAvatar
      $bg={bg}
      $fg={fg}
      $size={size}
      $ring={ring}
      style={style}
      className={className}
      aria-label={name || 'User avatar'}
      title={name}
    >
      {initials(name)}
    </StyledAvatar>
  );
};

export default Avatar;
