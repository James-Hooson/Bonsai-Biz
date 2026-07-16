# Bonsai Project - Codebase Audit Report
**Date:** 2026-07-16
**Branch:** main
**Auditor:** Claude Code (Sonnet 5)

---

## Scope

Full codebase review of `/src`, `/functions/src`, `firestore.rules`, `storage.rules`, and config files, following on from `Claude_report_2026-07-14.md`. Six commits landed since that audit (`27669b4`…`6f71c0c`, all 2026-07-15): a Firebase-Auth bridge for Auth0, Firestore/Storage rules, checkout idempotency + pending-order expiry, a working Contact form backend, and an accessibility pass on `Header.tsx`/`Shop.tsx`/`OrderSuccess.tsx`, plus a first test (`vitest` + `@testing-library/react`). Includes terminal diagnostics from the TypeScript compiler, ESLint, and the new test suite.

---

## Terminal Diagnostics Summary

### TypeScript Compiler (`tsc -b --noEmit`)
- **0 errors** — Clean compile.

### ESLint (`eslint .`)
- **0 errors, 0 warnings** — Clean. All 4 errors from the prior audit are gone.

### Tests (`vitest run`)
- **1 test file, 2 tests, all passing** (`src/components/CartSidebar.test.tsx`).

---

## Fixed / Resolved Since 2026-07-14

- **CRITICAL — Auth0/Firebase Auth gap closed.** `src/lib/firebaseAuthBridge.ts` + `functions/src/mintFirebaseToken.ts` verify the Auth0 ID token (JWKS, RS256, audience/issuer, `email_verified`) and mint a Firebase custom token, which `App.tsx:38-52` exchanges via `signInWithCustomToken` on every auth-state change. `firestore.rules`/`storage.rules` now correctly evaluate `request.auth` for admin writes. Admin UI (`Shop.tsx`, `AdminPanel.tsx`) gates writes behind a new `firebaseReady` flag so buttons disable instead of firing a doomed request during the sync window.
- **CRITICAL — dead `bonsai/` functions codebase removed.** `firebase.json` now declares a single `default` functions codebase; the directory and CI mismatch are gone.
- **HIGH — Stripe webhook idempotency added.** `stripeWebhook.ts:74-88` uses a Firestore transaction to flip `status` to `completed` only once before deducting stock; duplicate deliveries short-circuit.
- **HIGH — Contact form wired up.** `functions/src/sendContactEmail.ts` (nodemailer + Gmail app password via `defineSecret`) replaces the old `alert()`-only stub; `Contact.tsx:20-50` posts to it with loading/error states.
- **HIGH — ESLint errors fixed:** `stripeWebhook.ts`'s `(req as any).rawBody` is now plain `req.rawBody`; `OrderSuccess.tsx` no longer calls `setState` synchronously in an effect; `Shop.tsx`'s unused `id` destructures are gone.
- **HIGH — Storage rules added and wired up.** `storage.rules` (public read, admin write, 5MB/image-type cap) now exists and is referenced from `firebase.json`.
- **MEDIUM — Checkout CORS restricted.** `createCheckoutSession.ts:9-12` now uses an `ALLOWED_ORIGINS` allow-list instead of `cors: true`.
- **MEDIUM — Checkout idempotency added.** Client generates a stable `idempotencyKey` per cart session (`CartSidebar.tsx:29`); the server derives a deterministic order-doc ID from it and passes it to Stripe's API (`createCheckoutSession.ts:143-186`), so retries reuse the same order/session instead of duplicating.
- **MEDIUM — Abandoned orders now cleaned up.** `stripeWebhook.ts:115-136` handles `checkout.session.expired` and marks the order `expired`; `OrderSuccess.tsx:134-149` renders a matching "session expired" state.
- **MEDIUM — Derived values memoized.** `filteredProducts`/`cartItemCount` (`Shop.tsx:179-195`) and `orderTotal` (`OrderSuccess.tsx:60-63`) now use `useMemo`.
- **MEDIUM — Shop dropdown keyboard-accessible; aria-labels added.** `Header.tsx` dropdown now has `aria-expanded`/`aria-haspopup`/`aria-controls`/`role="menu"`, Escape-to-close, focus/blur handling, and icon buttons across `Header.tsx`/`Shop.tsx` have `aria-label`s.
- **LOW — Storage filenames now UUID-based**, not `Date.now()` (`ProductModal.tsx:192`).
- **LOW — Unused `AUTH0_ROLES_CLAIM` constant removed** from `types.ts`.
- **Node engine mismatch resolved** — moot now that `bonsai/`'s `engines.node: 24` is gone; `functions/package.json` (`node: 20`) matches CI's `actions/setup-node@v4` (`node-version: '20'`).
- CI (`firebase-hosting-merge.yml`/`firebase-hosting-pull-request.yml`) now runs `npm test` before `npm run build`, so the new test suite gates deploys.

Still open from the last audit: "Founded in 2023" outdated, branding inconsistency, placeholder phone number, out-of-stock overlay green, no SEO meta tags, unverifiable "50+ Tanks Built" stat, `AdminPanel` orders listener unpaginated.

---

## Findings by File

### src/components/Header.tsx
- **New bug:** the "House Plants" dropdown link (`to="/?category=houseplants"`, line 112) doesn't match any real `mainCategory` value — `Shop.tsx:42` and `ProductModal.tsx:86` both use `potted-plants`. Clicking it always renders an empty product grid. The dropdown also has no entry at all for the `aquatic-plants` category that exists in `Shop.tsx:43`/`ProductModal.tsx:87`.
- Branding still inconsistent: "Zen Oasis" (line 52) vs "ZenBonsai" (`About.tsx:24,42`) vs `<title>bonsai</title>` in `index.html`.

### src/components/OrderSuccess.tsx
- Destructures `PageProps` without `firebaseReady` (lines 25-30) and starts the `orders/{orderId}` `onSnapshot` listener as soon as `isAuthenticated` is true (lines 39-58), without waiting for the Firebase custom-token exchange to finish. If a logged-in customer (most commonly an admin testing checkout) lands on `/success` right after login, the read is rejected by `firestore.rules` (`request.auth` still null), the one-shot error callback sets `error = 'Failed to load order'`, and the page never retries once `firebaseReady` flips true — `Shop.tsx`/`AdminPanel.tsx` guard against this same race, this file doesn't.

### functions/src/createCheckoutSession.ts
- `ALLOWED_ORIGINS` (lines 9-12) falls back to `['http://localhost:5173', 'http://localhost:5173']` (a duplicated entry, and notably no production origin) if `BASE_URL` isn't set in the Cloud Functions environment at deploy time — a missing/misconfigured env var would silently CORS-block checkout from the live site with no obvious error signal. (Currently mitigated: `functions/.env.bonsai-new` sets `BASE_URL` correctly.)
- Error responses still echo `productData.name` on stock failures (lines 95, 103) to unauthenticated callers — downgraded from the prior report (no longer leaks stock counts), but still a minor internal-data leak.
- Idempotency, stock validation, and server-side pricing are otherwise solid (lines 54-65, 92-127, 143-192).

### functions/src/mintFirebaseToken.ts
- Solid implementation: RS256 verification via `jwks-rsa`, audience/issuer pinned, `email_verified` required before minting. `cors: true` is fine here since the security boundary is JWT verification, not origin.

### functions/src/sendContactEmail.ts
- `cors: true` with no rate limiting — any origin can trigger an email send. Low request cost today, but worth a rate limit or App Check before this gets linked from anywhere else, since repeated abuse risks Gmail flagging/throttling the sending account.
- Input validation (length caps, non-empty checks) is otherwise reasonable (lines 17-39).

### src/components/AdminPanel.tsx
- Orders `onSnapshot` (lines 35-44) still has no `limit()`/pagination — unresolved from the last audit. Now correctly gated behind `ready` (`firebaseReady`), which fixes the previous permission-denied failure mode.

### src/components/Shop.tsx
- Out-of-stock overlay still `bg-green-500/50` (line 299) — green for a negative state, unresolved.
- Everything else (loading/error states, memoization, admin-write guards) looks solid.

### src/components/Contact.tsx
- Now functional end-to-end. Placeholder phone number `(123) 456-7890` still present (line 207).

### src/components/Aquascaping.tsx / About.tsx / index.html
- Unverifiable marketing stat "50+ Tanks Built" (`Aquascaping.tsx:158-159`), "Founded in 2023" (`About.tsx:103`), no SEO meta tags (`index.html`) — all unresolved, unchanged since last audit.

### functions/.env.bonsai-new
- Tracked in git (`BASE_URL`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`) — not a secret leak; these are public-ish values and match the hardcoded fallback defaults already in `mintFirebaseToken.ts:6-7`. Fine as-is.

---

## Security Review

### Firestore / Storage rules
No longer broken — the Auth0→Firebase Auth bridge means `request.auth` is now populated for logged-in admins, so the email-allow-list checks in both `firestore.rules` and `storage.rules` function as intended. Order docs remain write-protected (`allow write: if false`, Cloud Functions only) and readable only by the owning customer or an admin.

### Stripe webhook / checkout
Idempotency, signature verification, and expired-session cleanup are all in place (see Fixed/Resolved above). No new issues found.

### Open-CORS endpoints
Two functions (`mintFirebaseToken`, `sendContactEmail`) still use `cors: true`. `mintFirebaseToken` is safe by design (JWT-verified regardless of origin). `sendContactEmail` has no such secondary gate — see Findings above.

### Secrets handling
Unchanged from last audit and still correct: Stripe keys and the new `GMAIL_APP_PASSWORD` all use `defineSecret` (Firebase Secret Manager); `.env.production`/`.env.bonsai-new` contain only client-safe config.

---

## Configuration File Issues

- CI (`firebase-hosting-merge.yml`) now authenticates via `google-github-actions/auth@v2` + `npx firebase-tools deploy` for functions, replacing the previous manual "write SA JSON to disk" step — a cleaner pattern than before.
- `package.json` now has a real test script (`vitest run`) gating CI, but coverage is minimal — see Suggestions.
- No other new configuration issues found; `eslint.config.js`'s project-wide `globals.browser` (including `functions/src`) is unchanged and still not causing failures.

---

## Suggestions for Improvement

1. **Fix the Header dropdown category mismatch** — either rename the `houseplants` link to `potted-plants` or rename the category value itself, and add the missing `aquatic-plants` dropdown entry.
2. **Gate `OrderSuccess.tsx`'s order listener on `firebaseReady`**, same pattern as `Shop.tsx`/`AdminPanel.tsx`, so a fresh login doesn't produce a permanent "Failed to load order" error.
3. **Harden `createCheckoutSession`'s CORS fallback** — fail closed (or log loudly) if `BASE_URL` is unset, instead of silently defaulting to a config with no production origin.
4. **Add rate limiting to `sendContactEmail`** (App Check or a simple per-IP/time-window check) before it's exposed to more traffic.
5. **Expand test coverage** — the checkout/idempotency flow, webhook stock-deduction transaction, and the Auth0→Firebase token bridge are all payment- or auth-critical and currently untested; today's suite only covers `CartSidebar` rendering.
6. **Paginate `AdminPanel`'s orders listener** (`limit()` + "load more") before the orders collection grows large.
7. **Clean up remaining cosmetic/content issues**: outdated founding-year copy, phone number placeholder, green out-of-stock overlay, branding inconsistency, SEO meta tags, unverifiable stats.

---

## Triage List

### HIGH
| # | Issue | File | Line(s) |
|---|-------|------|---------|
| 1 | "House Plants" dropdown links to a category value (`houseplants`) that doesn't match any real product category (`potted-plants`) — always renders an empty grid; "Aquatic Plants" has no dropdown link at all | Header.tsx; Shop.tsx; ProductModal.tsx | Header.tsx 112; Shop.tsx 42-43; ProductModal.tsx 86-87 |
| 2 | Order-confirmation page doesn't wait for `firebaseReady` before reading the order doc — logged-in users can hit a permanent permission-denied error right after login | OrderSuccess.tsx | 25-58 |

### MEDIUM
| # | Issue | File | Line(s) |
|---|-------|------|---------|
| 3 | `sendContactEmail` open CORS with no rate limiting — spam/abuse vector, risks Gmail throttling | functions/src/sendContactEmail.ts | 22 |
| 4 | Checkout CORS allow-list silently degrades to duplicate-localhost/no-prod-origin if `BASE_URL` is unset at deploy time | functions/src/createCheckoutSession.ts | 9-12 |
| 5 | AdminPanel orders listener still unpaginated | src/components/AdminPanel.tsx | 35-44 |
| 6 | Checkout stock-failure errors still echo product names to unauthenticated callers (reduced severity vs. last audit) | functions/src/createCheckoutSession.ts | 95, 103 |

### LOW
| # | Issue | File | Line(s) |
|---|-------|------|---------|
| 7 | Test coverage limited to `CartSidebar` rendering — no tests for checkout, webhook idempotency, or the Auth0/Firebase bridge | src/ (test suite) | — |
| 8 | "Founded in 2023" still outdated | About.tsx | 103 |
| 9 | Branding inconsistency: "Zen Oasis" / "ZenBonsai" / "bonsai" | Header.tsx; About.tsx; index.html | 52; 24, 42; title |
| 10 | Placeholder phone number | Contact.tsx | 207 |
| 11 | Out-of-stock overlay still uses green background | Shop.tsx | 299 |
| 12 | No SEO meta tags | index.html | — |
| 13 | Unverifiable marketing stat ("50+ Tanks Built") | Aquascaping.tsx | 158-159 |

---

**Total Issues Found:** 13
- Critical: 0
- High: 2
- Medium: 4
- Low: 7

**Resolved since 2026-07-14:** 16 (both prior CRITICALs, 6 of 6 prior HIGHs, 5 of 7 prior MEDIUMs, 3 of 9 prior LOWs)
