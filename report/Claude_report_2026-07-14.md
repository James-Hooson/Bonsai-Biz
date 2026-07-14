# Bonsai Project - Codebase Audit Report
**Date:** 2026-07-14
**Branch:** main
**Auditor:** Claude Code (Sonnet 5)

---

## Scope

Full codebase review of `/src`, `/functions/src`, `/bonsai`, `firestore.rules`, and config files, following on from the prior audits (`Claude_report_2026-02-12.md`, `Claude_fixes_report.md`). Since then the project has added an Auth0 admin panel, an aquascaping page, and a Firebase Cloud Functions backend for Stripe payments (checkout session creation + webhook). Includes terminal diagnostics from the TypeScript compiler and ESLint.

---

## Terminal Diagnostics Summary

### TypeScript Compiler (`tsc -b --noEmit`)
- **0 errors** — Clean compile.

### ESLint (`npx eslint .`)
- **4 errors, 0 warnings**

| File | Line | Rule | Description |
|------|------|------|-------------|
| functions/src/stripeWebhook.ts | 16:29 | `no-explicit-any` | `(req as any).rawBody` — untyped webhook request |
| OrderSuccess.tsx | 41:7 | `react-hooks/set-state-in-effect` | `setLoading(false)` called synchronously inside a `useEffect` body |
| Shop.tsx | 88:15 | `no-unused-vars` | `id` destructured but never used |
| Shop.tsx | 96:15 | `no-unused-vars` | `id` destructured but never used |

---

## Fixed / Resolved Since 2026-02-12

- `firebase.json` hosting `public` corrected to `"dist"`.
- `src/firebase.ts:14-18` — env var validation added; throws on any missing `VITE_FIREBASE_*` var.
- `main.tsx:7-10` — non-null assertion replaced with an explicit guard that throws a descriptive error.
- Shared `User`/`PageProps` type adopted across components (`types.ts:3-9`) via `@auth0/auth0-spa-js` — the old 6-component `user: any` ESLint errors are gone.
- `AUTH0_ROLES_CLAIM` / `ADMIN_EMAILS` constants centralized in `types.ts` — no more duplicated hardcoded claim strings.
- Shop.tsx: loading/error states added for product fetch (lines 37-38, 60-79, 252-265), with a "Try Again" retry button.
- ProductModal.tsx: file-size validation added (`MAX_FILE_SIZE_MB = 5`, line 184-187).
- Stripe pricing is computed server-side from Firestore `productData.price` (`createCheckoutSession.ts:91-102`), not from client input — avoids a client-trusted-amount vulnerability.

Still open from the last audit: Contact form non-functional, `filteredProducts`/`cartTotal`/`orderTotal` unmemoized, dropdown mouse-only, missing aria-labels, "Founded in 2023" outdated, branding inconsistency, no test framework, `Date.now()` storage filenames, no SEO meta tags.

---

## Findings by File

### functions/src/createCheckoutSession.ts
- `cors: true` (line 22) with no auth check allows any origin to call the endpoint, spam Firestore `orders` writes, and create Stripe sessions — cost/quota abuse vector.
- Error responses (lines 81, 86) leak product stock counts/names to unauthenticated callers.
- No idempotency protection — a retried request creates a duplicate pending order + Stripe session (lines 124, 138); the only guard is the client-side `isCheckingOut` disable in `CartSidebar.tsx:24,29`.
- Pending orders from abandoned/expired checkouts are never cleaned up or marked failed — `orders` accumulates permanently-`pending` docs.
- Good: stock validated server-side (lines 79-89) and price computed server-side (line 99).

### functions/src/stripeWebhook.ts
- **No idempotency guard on webhook delivery.** Stripe redelivers events at-least-once; there's no check of `order.status` before re-running the stock-deduction transaction (lines 74-95) and no `event.id` dedupe — a duplicate delivery double-decrements stock.
- Line 16: `(req as any).rawBody` — ESLint error; should use a properly typed request.
- Signature verification via `stripe.webhooks.constructEvent` on the raw body (lines 26-31) is correctly implemented.
- Always returns 200 even when internal processing fails (lines 96-98 only log) — correct per Stripe's retry-suppression guidance, but a failed stock deduction is silently swallowed with no alerting.

### firestore.rules
- See Security section below — this is the most significant finding in this audit.

### src/components/AdminPanel.tsx
- Reads all orders via `onSnapshot` with no pagination/limit (lines 35-42) — won't scale, and (per the rules issue below) currently fails with `permission-denied` for every user in production.

### src/components/Aquascaping.tsx
- No material issues. Minor: hardcoded marketing stat "50+ Tanks Built" (line 158) is unverifiable copy, same class of issue as About.tsx's founding-year claim.

### src/components/Header.tsx
- Shop dropdown (lines 49-52) still `onMouseEnter`/`onMouseLeave` only — not keyboard accessible (unresolved).
- Cart badge/search/menu buttons (lines 139-160, 191-200) still lack `aria-label`.
- Branding still inconsistent: "Zen Oasis" (line 45) vs "ZenBonsai" (About.tsx:24) vs `<title>bonsai</title>` in index.html.

### src/components/Shop.tsx
- Lines 88, 96: unused `id` destructure (ESLint errors).
- `filteredProducts` (169-176) and `cartItemCount` (178) still recomputed every render without `useMemo`.
- Out-of-stock overlay still `bg-green-500/50` (line 282) — green for a negative state, unresolved.
- `handleCheckout` (139-167) does a raw `fetch` with no timeout/abort handling — if the Cloud Function hangs, `isCheckingOut` never resolves and the UI waits indefinitely.
- Admin writes (`handleSaveProduct`, `handleDeleteProduct`, 85-108) go straight through the client Firestore SDK — see Security section, these are gated by rules that can never currently pass.

### src/components/OrderSuccess.tsx
- Line 41: `setLoading(false)` called synchronously in an effect body (ESLint error).
- `orderTotal` (66-69) still unmemoized; `key={index}` still used for order items (line 157) — both unresolved.
- Depends on a Firestore `orders/{orderId}` read gated by the same broken rule described below.

### src/components/Contact.tsx
- Still non-functional: `handleSubmit` (19-23) only shows an `alert()` and resets local state — no backend call, no Cloud Function, no email dispatch.
- Placeholder phone number `(123) 456-7890` still present (line 175). No field validation/required attributes.

### src/components/ProductModal.tsx
- Storage filenames still `Date.now()`-based (line 192) — collision-prone; should use a UUID. File-size cap and upload-disabled states are otherwise a solid improvement.

### src/components/CartSidebar.tsx / About.tsx / CareGuide.tsx
- No material new issues; same unmemoized-derived-value and missing-aria-label patterns as the last audit.

### bonsai/src/index.ts
- Dead scaffold file (only `setGlobalOptions`, no real exports) left over from `firebase init functions`, but it's wired into `firebase.json` as a live second functions codebase — see Configuration section.

---

## Security: Stripe / Admin / Firestore Rules

### CRITICAL — Firestore rules require Firebase Auth, but the app only ever authenticates with Auth0
The app uses `@auth0/auth0-react` exclusively (`main.tsx:14-24`). There is no `signInWithCustomToken`, no `getAuth()`, no `firebase/auth` import anywhere in `src/` or `functions/src/` (confirmed by repo-wide grep). Meanwhile `firestore.rules` gates every write/read behind `request.auth != null`:

```
match /products/{productId} {
  allow write: if request.auth != null && request.auth.token.email in [...]   // lines 6-7
}
match /orders/{orderId} {
  allow read: if request.auth != null && (... )                              // lines 13-16
}
```

Since the browser client never holds a Firebase Auth session, `request.auth` is **always null** on every direct Firestore SDK call the app makes. Concretely, in production today:
- `Shop.tsx`'s admin add/edit/delete product calls (`addDoc`/`updateDoc`/`deleteDoc`) are rejected with `permission-denied`, regardless of the client-side `isAdmin` check (`Shop.tsx:181`, `Header.tsx:38`) — that check only toggles UI visibility; the actual write fails.
- `AdminPanel.tsx`'s order `onSnapshot` listener (35-42) and `OrderSuccess.tsx`'s order-status listener (45-64) are also rejected — the admin order dashboard and the post-purchase confirmation page cannot read order data at all.

This looks like a regression rather than a pre-existing gap: `git show 214e853` ("Security tightening", 2026-06-08) changed the orders rule from `allow read: if true` to the `request.auth != null` form above, the same day as "firebase and Auth security" and "Secret admin." It's likely this was never exercised against deployed rules outside the emulator (where auth is often stubbed/permissive), which would mask the break.

**Recommendation:** either bridge Auth0 → Firebase Auth (a Cloud Function verifies the Auth0 JWT and mints a Firebase custom token, client calls `signInWithCustomToken`), or move all admin-gated reads/writes behind Cloud Functions that verify the Auth0 token server-side and use the Admin SDK (bypassing rules) — the same pattern already used for order creation in `createCheckoutSession.ts`.

### HIGH — Webhook idempotency gap
Detailed above (`stripeWebhook.ts:74-95`) — duplicate Stripe event delivery double-deducts stock.

### MEDIUM — Open CORS, unauthenticated checkout endpoint
`createCheckoutSession` (`cors: true`, no auth check) lets any origin create Firestore order docs and Stripe sessions; consider an auth/App Check requirement and rate limiting.

### MEDIUM — Storage rules untracked
No `storage.rules` file exists, and `firebase.json` has no `"storage"` key — Storage security rules are entirely unmanaged by this repo/CI, so whatever is live in the console is un-auditable and can drift silently. Given the same Auth0/Firebase-Auth gap, if the live Storage rules require `request.auth`, product image uploads (`ProductModal.tsx:190-196`) would also currently fail.

### LOW — Secrets handling
Stripe secret/webhook secret correctly use `defineSecret` (Firebase Secret Manager) rather than being hardcoded. `.env.production` (tracked in git per `dcab4ce`) contains the Firebase Web API key — normal for a Firebase client app (protected by rules/App Check, not a true secret), but worth a comment noting this is intentional so nobody "rotates" it thinking it leaked.

---

## Configuration File Issues

- **`firebase.json` declares two functions codebases** — `default` (`functions/`) and `bonsai` (`bonsai/`). The `bonsai/` codebase is dead scaffold code (no real exports) but is deployed on every `firebase deploy --only functions`. Its `predeploy` runs `npm --prefix bonsai run build`, but neither GitHub Actions workflow installs dependencies inside `bonsai/` — only `functions/` gets `npm ci`. This likely makes the functions-deploy CI step fail or silently no-op for the `bonsai` codebase. Recommend deleting the `bonsai/` codebase entry (and directory) entirely, or wiring it up properly if it has a purpose.
- `functions/package.json` engines `"node": "20"` vs `bonsai/package.json` engines `"node": "24"` — inconsistent runtime versions across codebases in the same project.
- `index.html` — still no meta description/Open Graph tags; `<title>bonsai</title>` is lowercase and inconsistent with "Zen Oasis"/"ZenBonsai" branding used elsewhere.
- CI (`firebase-hosting-merge.yml`) writes the Firebase service-account JSON to disk (`${{ runner.temp }}/firebase-sa.json`) to set `GOOGLE_APPLICATION_CREDENTIALS` for a manual `firebase deploy --only functions` step, alongside the separate `FirebaseExtended/action-hosting-deploy@v0` action for hosting. Works, but is a slightly riskier pattern than the action's native auth handling; consider consolidating.
- `package.json` — still no test framework or test script.
- `eslint.config.js` applies `globals: globals.browser` project-wide to `**/*.{ts,tsx}`, including `functions/src` and `bonsai/src`, which are Node/server files. Not currently causing failures, but worth a dedicated override block for `functions/**`.

---

## Suggestions for Improvement

1. **Fix the Firestore Auth gap first** — this is the single highest-impact item; admin product management and order visibility are currently broken in production regardless of any UI-level `isAdmin` check.
2. **Add webhook idempotency** — check `order.status` (or maintain a processed-events collection keyed by `event.id`) before mutating stock in `stripeWebhook.ts`.
3. **Lock down `createCheckoutSession`** — restrict CORS to the production origin, and consider requiring an Auth0-issued token verified server-side before creating a Stripe session.
4. **Remove or properly wire up the `bonsai/` functions codebase** — it's currently dead weight that may be silently breaking CI.
5. **Add `storage.rules` to the repo** and reference it from `firebase.json` so Storage security is version-controlled and auditable.
6. **Wire up the Contact form** to a Cloud Function or Firestore write (still parked from the last audit).
7. **Memoize derived data** — `filteredProducts`, `cartItemCount`, `orderTotal`.
8. **Improve accessibility** — aria-labels on icon buttons, keyboard-navigable dropdown.
9. **Add a testing setup** — `vitest` + `@testing-library/react`, plus a smoke test for the checkout/webhook flow given it now touches real payments.

---

## Triage List

### CRITICAL
| # | Issue | File | Line(s) |
|---|-------|------|---------|
| 1 | Firestore rules require `request.auth != null`, but the app never establishes a Firebase Auth session (Auth0-only) — all admin product writes and all order reads (AdminPanel, OrderSuccess) fail with permission-denied in production | firestore.rules; Shop.tsx; AdminPanel.tsx; OrderSuccess.tsx | rules 6-7, 13-16; Shop.tsx 85-108; AdminPanel.tsx 35-42; OrderSuccess.tsx 45-64 |
| 2 | `bonsai` functions codebase wired into firebase.json but never `npm ci`'d in CI — functions deploy likely fails/no-ops | firebase.json; .github/workflows/firebase-hosting-merge.yml | firebase.json ~30-45 |

### HIGH
| # | Issue | File | Line(s) |
|---|-------|------|---------|
| 3 | Stripe webhook has no idempotency guard — duplicate delivery double-deducts stock | functions/src/stripeWebhook.ts | 74-95 |
| 4 | Contact form still non-functional (alert only, no backend) | Contact.tsx | 19-23 |
| 5 | `(req as any).rawBody` — ESLint error, untyped webhook request | functions/src/stripeWebhook.ts | 16 |
| 6 | `setState` called synchronously in effect body — ESLint error | OrderSuccess.tsx | 41 |
| 7 | Unused `id` destructure ×2 — ESLint errors | Shop.tsx | 88, 96 |
| 8 | Storage security rules untracked/unmanaged by repo or firebase.json | firebase.json | (missing "storage" key) |

### MEDIUM
| # | Issue | File | Line(s) |
|---|-------|------|---------|
| 9 | Unauthenticated, open-CORS checkout endpoint — abuse/cost vector, leaks stock via error text | functions/src/createCheckoutSession.ts | 22, 81, 86 |
| 10 | No idempotency on checkout session creation (double order/session on client retry) | createCheckoutSession.ts; CartSidebar.tsx | 124, 138; 24-39 |
| 11 | Abandoned/expired pending orders never cleaned up or marked failed | createCheckoutSession.ts | 124-133 |
| 12 | `filteredProducts`, `cartItemCount`, `orderTotal` still unmemoized | Shop.tsx; OrderSuccess.tsx | 169-178; 66-69 |
| 13 | Shop dropdown still not keyboard accessible; missing aria-labels on icon buttons | Header.tsx | 49-52, 139-200 |
| 14 | Out-of-stock overlay still uses green background | Shop.tsx | 282 |
| 15 | Node engine mismatch between functions codebases (20 vs 24) | functions/package.json; bonsai/package.json | engines |

### LOW
| # | Issue | File | Line(s) |
|---|-------|------|---------|
| 16 | "Founded in 2023" still outdated | About.tsx | 103, 135 |
| 17 | Branding inconsistency: "Zen Oasis" / "ZenBonsai" / "bonsai" | Header.tsx; About.tsx; index.html | 45; 24; title |
| 18 | Placeholder phone number | Contact.tsx | 175 |
| 19 | `Date.now()`-based storage filenames (collision risk) | ProductModal.tsx | 192 |
| 20 | No SEO meta tags | index.html | — |
| 21 | No test framework or test scripts | package.json | — |
| 22 | Unverifiable marketing stat ("50+ Tanks Built") | Aquascaping.tsx | 158-172 |
| 23 | `AUTH0_ROLES_CLAIM` constant defined but appears unused now that admin gating uses `ADMIN_EMAILS` | types.ts | 11 |
| 24 | CI writes service-account JSON to disk rather than using action-native auth | .github/workflows/firebase-hosting-merge.yml | "Write Firebase Service Account" step |

---

**Total Issues Found:** 24
- Critical: 2
- High: 6
- Medium: 7
- Low: 9
