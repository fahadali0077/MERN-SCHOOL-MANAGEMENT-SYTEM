# Logo & Branding

The SchoolMS logo is an accent-blue rounded tile (#0066FF) containing the lucide
"School" icon in white, beside the "SchoolMS" wordmark (School in the primary text
color, MS in accent blue). This is the same mark used in-app and for all site icons.

## Assets (client/public/)
- `favicon.svg`            — primary favicon (scalable, accent tile + School icon)
- `favicon.ico`            — multi-size ICO fallback (16/32/48) for older browsers
- `favicon-16/32/48/192/512.png` — PNG fallbacks / PWA icons
- `apple-touch-icon.png`   — 180×180 full-bleed icon for iOS home screen
- `logo.svg`               — standalone logo mark (use as an <img> anywhere)
- `site.webmanifest`       — PWA manifest (theme #0066FF, icons wired)
- `og-image.jpg`           — social share image (unchanged)

All are linked from `client/index.html`.

## In-app logo
`client/src/components/ui/Logo.tsx` is a reusable component rendering the same mark.
Props: `size` (tile px, default 36), `showText` (wordmark, default true), `glow`
(accent shadow, default true). It is used in the Landing nav + footer, Login (desktop
+ mobile), Register, and the dashboard sidebar (text auto-hides when collapsed).
To change the brand in one place, edit this component (and regenerate the favicons
from the same paths if the icon changes).
