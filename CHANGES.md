# Fixes Applied — Code Review Pass

## 1. Dark + Light Theme (new)
- **Tailwind config**: color utilities (`bg-bg-primary`, `text-text-primary`, `border-border`, etc.) now reference CSS variables instead of hardcoded dark hex, so they repaint on theme switch.
- **globals.css**: defined full **dark** (`:root`, `:root.dark`) and **light** (`:root.light`) palettes; removed duplicate `@tailwind` blocks and a stray `.input` fragment; moved tokens out of `@layer components` so they're never purged; added smooth color transitions and `color-scheme`.
- **Theme wiring**: `uiSlice` initializes from `localStorage` (then OS preference), persists on change, and exposes `toggleTheme`/`setTheme`/`selectTheme`. A `ThemeApplier` in `App.tsx` applies the `light`/`dark` class to `<html>`.
- **Controls**: working Dark/Light selector in **Settings** (was disabled "Coming soon"); one-click toggle in the dashboard **topbar**.
- **Light-mode compatibility layer**: remaps the ~140 hardcoded `white/N` opacity utilities (borders, backgrounds, hovers) to dark tints under `.light` so separators/hovers stay visible. Toast colors and the tooltip text also made theme-aware.

## 2. TypeScript errors (5 → 0)
- Added `src/vite-env.d.ts` — fixed 3 `import.meta.env` "Property 'env' does not exist" errors.
- ProfilePage: added `phone` to the form type and the `reset()` call (was typed only `firstName | lastName` but registered `phone`).

## 3. Dead-ends removed
- **Quick search** (topbar): now navigates to Students + a global ⌘K / Ctrl+K shortcut.
- **Students › Filter**: working status dropdown (All / Active / Inactive / Transferred / Graduated) wired to the backend `filter[status]` param.
- **Student detail › Edit** + **Add Student page**: retrofitted `AddStudent` into a dual create/edit form — detects `:id`, prefills via `useGetStudentQuery`, and calls `updateStudent`. (Previously Edit had no handler and the route would have opened an empty create form.)
- **Invoices › Pay Now** (student): now shows an informative message (no online gateway configured) instead of doing nothing.
- **Profile** per-row "Edit" buttons: removed (redundant + non-functional; name is editable via the main panel).
- **SuperAdmin dashboard**: "View all →" and per-row "Manage" now link to the Schools page.
- **Landing footer**: `href="#"` links replaced — Features/Pricing scroll to real sections, API Docs opens the backend Swagger UI (`/api/docs`).

## 4. Cleanup
- Removed stale `client/src/pages/admin/ClassesPage.tsx.bak`.

## Verification
- `tsc --noEmit`: 0 errors.
- `vite build`: succeeds.
- Backend: all 14 routes, 11 models, controllers, services, validators load cleanly (`node --check` passes on every file). Remaining backend "errors" are runtime env config (MongoDB/Redis/SMTP connection strings), not code bugs.

## Note on running locally
Set `client/.env` → `VITE_API_URL=http://localhost:5000` and fill `server/.env` (see `server/.env.example`).
