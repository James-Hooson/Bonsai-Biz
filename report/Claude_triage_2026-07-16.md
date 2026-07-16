# Bonsai Project - Open Issues Triage
**Date:** 2026-07-16
**Branch:** main
**Source:** `Claude_report_2026-07-16.md`, with the 2 HIGH items from that report already fixed this session (Header dropdown category mismatch, `OrderSuccess` `firebaseReady` race). Resolved issues are omitted — this is open items only.

---

## MEDIUM

### 1. Contact form has no rate limiting
**File:** `functions/src/sendContactEmail.ts:22`
**What it is:** The Cloud Function uses `cors: true` with no rate limit or App Check. Any origin can call it repeatedly, risking spam through the site's Gmail sending account (and possible throttling/suspension of that account).
**Fix:** Add a simple per-IP/time-window rate limit (e.g. a Firestore-backed counter or `firebase-functions` rate-limiting middleware), or require Firebase App Check on the endpoint.

### 2. Checkout CORS silently loses the production origin if `BASE_URL` is unset
**File:** `functions/src/createCheckoutSession.ts:9-12`
**What it is:** `ALLOWED_ORIGINS` is built as `[process.env.BASE_URL || 'http://localhost:5173', 'http://localhost:5173']`. If `BASE_URL` isn't set at deploy time, the list becomes two identical localhost entries and the live site is never in the allow-list — checkout would fail with a CORS error and no obvious signal why.
**Fix:** Read `BASE_URL` from a required `defineString`/secret so deploy fails loudly if it's missing, instead of silently falling back to localhost. Also dedupe the array.

### 3. Admin orders list has no pagination
**File:** `src/components/AdminPanel.tsx:35-44`
**What it is:** The `onSnapshot` query loads the entire `orders` collection with no `limit()`. This will slow down and eventually become unusable as order history grows.
**Fix:** Add `limit(N)` to the query plus a "load more" control (or switch to paginated `getDocs` calls with a cursor).

### 4. Checkout errors still leak product names
**File:** `functions/src/createCheckoutSession.ts:95, 103`
**What it is:** Out-of-stock and insufficient-stock error responses include `productData.name` in the message body, visible to any unauthenticated caller of the endpoint.
**Fix:** Return a generic message (e.g. "One or more items are unavailable") and log the specific product/stock detail server-side only.

---

## LOW

### 5. Minimal test coverage
**File:** `src/` (test suite)
**What it is:** Only one test file (`CartSidebar.test.tsx`, 2 tests) exists, covering basic rendering. The checkout flow, webhook stock-deduction/idempotency logic, and the Auth0→Firebase token bridge — all payment- or auth-critical — are untested.
**Fix:** Add unit tests for `stripeWebhook.ts`'s idempotency transaction, `createCheckoutSession.ts`'s validation/idempotency logic, and `firebaseAuthBridge.ts`; consider a mocked-Firestore integration test for the checkout flow.

### 6. Outdated founding-year copy
**File:** `src/components/About.tsx:103`
**What it is:** Still reads "Founded in 2023," which may no longer be accurate.
**Fix:** Update the copy or make it a relative/non-dated claim.

### 7. Inconsistent branding
**File:** `src/components/Header.tsx:52`; `src/components/About.tsx:24,42`; `index.html` title
**What it is:** The site refers to itself as "Zen Oasis" in the header, "ZenBonsai" on the About page, and lowercase "bonsai" in the HTML `<title>`.
**Fix:** Pick one brand name and apply it consistently across the header, About copy, and page title.

### 8. Placeholder phone number
**File:** `src/components/Contact.tsx:207`
**What it is:** The Contact page still shows `(123) 456-7890`, an obvious placeholder.
**Fix:** Replace with a real business number, or remove the phone card if none exists yet.

### 9. Out-of-stock overlay uses a green background
**File:** `src/components/Shop.tsx:299`
**What it is:** `bg-green-500/50` is used for the "Out of Stock" banner — green typically signals a positive/available state, which is misleading here.
**Fix:** Switch to a neutral/warning color (e.g. gray or red) for the out-of-stock overlay.

### 10. No SEO meta tags
**File:** `index.html`
**What it is:** No meta description, Open Graph tags, or other SEO metadata.
**Fix:** Add `<meta name="description">`, Open Graph (`og:title`, `og:description`, `og:image`), and a favicon/social-preview image.

### 11. Unverifiable marketing stat
**File:** `src/components/Aquascaping.tsx:158-159`
**What it is:** The page claims "50+ Tanks Built" with no supporting data — same class of issue as the founding-year claim.
**Fix:** Either back the number with real data or replace it with non-quantified marketing copy.

---

**Total Open Issues:** 11
- Medium: 4
- Low: 7
