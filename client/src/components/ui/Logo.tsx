import React from 'react';
import { School } from 'lucide-react';

interface LogoProps {
  /** Diameter of the icon tile in px (icon scales with it). Default 36. */
  size?: number;
  /** Show the "SchoolMS" wordmark next to the tile. Default true. */
  showText?: boolean;
  /** Add the accent glow shadow under the tile. Default true. */
  glow?: boolean;
  className?: string;
}

/**
 * SchoolMS brand mark — an accent rounded tile with the lucide "School" icon,
 * beside the "SchoolMS" wordmark. This is the same logo used for the favicon and
 * app icons (see client/public/favicon.svg). Use this everywhere a logo is needed
 * so the brand stays consistent and is easy to update in one place.
 */
export default function Logo({ size = 36, showText = true, glow = true, className = '' }: LogoProps) {
  const iconSize = Math.round(size * 0.52);
  const textSize = size <= 32 ? 'text-base' : size <= 40 ? 'text-lg' : 'text-xl';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`rounded-xl bg-accent flex items-center justify-center flex-shrink-0 ${glow ? 'shadow-glow-sm' : ''}`}
        style={{ width: size, height: size }}
      >
        <School size={iconSize} className="text-white" />
      </div>
      {showText && (
        <span className={`font-display font-bold leading-none ${textSize}`}>
          <span className="text-text-primary">School</span>
          <span className="text-accent">MS</span>
        </span>
      )}
    </div>
  );
}
