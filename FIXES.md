# Fixes Applied — MERN School Management System

This document lists every bug fixed in this pass, in the order they were applied.
All changes were verified: client `tsc --noEmit` passes with 0 errors, `vite build`
succeeds, and the server boots and serves requests (verified `/health`→200,
`/metrics`→401, `/api/v1/notices`→401 instead of a 500 crash).

## CRITICAL
1. **Notices endpoint 500 crash** — `routes/notice.routes.js` referenced an undefined
   `search` var. Now destructured from `buildQuery()`; cache key includes search/type.
2. **Logout never revoked refresh token** — `services/auth.service.js` refresh cookie
   path was `/api/v1/auth/refresh`, so it wasn't sent to `/auth/logout`. Widened to
   `/api/v1/auth` for both set and clear.
3. **Dashboards/stats returned zeros** — aggregation `$match` doesn't auto-cast
   `schoolId`. Cast to `ObjectId` in admin/student dashboards and student/teacher
   `getStats`; fixed the today-attendance date range; removed a nonsense ternary.
30. **SuperAdmin dashboard showed fake data** — rewrote `SuperAdminDashboard.tsx` to
    read real `/superadmin/overview` + `/superadmin/activity` instead of mock constants.
31. **Manual attendance impossible on a fresh day** — `AttendancePage.tsx` now fetches
    the class roster (`useGetStudentsQuery`) and renders a row per student, seeded from
    any existing record; "Mark All" and the save payload use the full roster.
32. **Report card printed blank** — `globals.css` `@media print` hid `[class*="animate-"]`,
    which matched the report itself. Now neutralises animations without hiding; chrome-only
    hide. Deleted the dead, never-imported `styles/print.css`.

## HIGH
4. **Orphaned User on student create** — wrapped User+Student creation in a transaction.
6. **Cross-user data leak on logout** — added `performLogout` thunk that also calls
   `apiSlice.util.resetApiState()` + `disconnectSocket()`; wired into all logout paths.
7. **Dead email-verification link** — added `/auth/verify-email` route + `VerifyEmail` page.
8. **changePassword left old tokens valid** — now clears `refreshTokens` + validates input.
9. **Bull queue / worker contradiction** — `initQueues()` runs once from app.js after
   Redis connects; `ecosystem.config.js` runs a single fork instance (no duplicate worker).
10. **AddStudent focus loss** — `Field` moved out of render (was redefined each render).
11. **Settings toggles didn't persist** — added attendance/fees/results to User prefs schema.
12. **Fee category mismatch** — aligned AddStudent and FeeStructure categories.
13. **Student list cache ignored status filter** — cache key now includes the filter.
14. **Student stats cache never invalidated** — create/update/delete now bust it.
15. **N+1 in class invoice generation** — replaced per-student findOne with one `$in`
    query + Set; uses the real school code for invoice numbers.
16. **Name search returned nothing** — getAll uses an aggregation `$lookup` on users.
17. **Validators never applied** — wired the express-validator suite into all routes.
18. **Socket.io CORS mismatch** — socket now uses the same allowed-origins list as HTTP.
19. **No fail-fast on missing secrets** — app exits with a clear message if env vars missing.
33. **Student document upload non-functional** — route runs `processDocument`; controller
    guards `req.file.location`; client sends a valid enum `type`.
34. **Assignment submit saved empty text** — client sends `{text}`; list returns
    `hasSubmitted`/`mySubmission`.
35. **Exam→Marks broken** — Create Exam has a subjects multi-select + required academicYear.
36. **School creation produced admin-less school** — phone required; controller provisions
    a schoolAdmin user (transaction) and emails credentials.

## MEDIUM / LOW
20. **refreshTokens TTL** — sub-doc TTL doesn't work; tokens pruned in code on login.
21. **/metrics public** — now requires `authenticate, authorize('superAdmin')`.
22. **QR scan trusted client studentId** — now derives the student from `req.user`.
23. **JWT expiry env name mismatch** — `.env.example` + `render.yaml` aligned to
    `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES`.
24. **TWILIO_* undocumented** — added to `.env.example`.
25. **getClasses unbounded** — added a 500-row safety cap (still cached for dropdowns).
26. **Notification cache mismatch** — `create`/`createBulk` use `delPattern(...:*)`.
27. **StudentsPage global debounce** — replaced `window._searchTimer` with `useRef`;
    added scroll-to-top on page change.
28. **Fee label hardcoded "/mo"** — now frequency-aware.
29. **Login min-length 6 vs server 8** — aligned to 8.

## Notes
- `components/ui/index.tsx` is unused dead code (every page uses the standalone
  `ConfirmDialog`); left in place to avoid touching untraced imports.
- Verified with: `tsc --noEmit` (0 errors), `vite build` (success), server boot smoke test.

## Email provider — Brevo
Added Brevo (formerly Sendinblue) as the preferred email provider via its SMTP relay
(`smtp-relay.brevo.com:587`), used through nodemailer with no extra SDK.

Provider priority is now: **BREVO_API_KEY → SENDGRID_API_KEY → SMTP_* → (dev) Ethereal**.

Set these env vars (server `.env` locally, Render dashboard in production):
- `BREVO_API_KEY`   — SMTP key from Brevo → SMTP & API → SMTP (starts with `xkeysib-`)
- `BREVO_SMTP_USER` — the "Login" on that same page (e.g. `8xxxxx@smtp-brevo.com`)
- `EMAIL_FROM`      — a sender address verified in Brevo (Senders & IP)

If `BREVO_SMTP_USER` is omitted, the service falls back to `EMAIL_FROM` as the SMTP
login and logs a warning. Email failures are logged and swallowed, never crash a request.
Verified: service boots and logs "📧 Email: using Brevo" when the key is present.
