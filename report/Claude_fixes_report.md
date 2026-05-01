# Bonsai Project - Fixes Report
**Date:** 2026-02-12
**Branch:** refactor
**Auditor:** Claude Code (Opus 4.6)

---

## Critical Fixes

### Critical 1 — firebase.json: Deployment serving wrong directory
**Problem:** `"public": "public"` told Firebase Hosting to serve the raw `/public` folder instead of the Vite build output in `/dist`. Deployments were broken.

**Fix:** Changed `"public": "public"` to `"public": "dist"` in `firebase.json` line 3.

**Files changed:** `firebase.json`

---

### Critical 2 — Contact.tsx: Form doesn't send messages (PARKED)
**Problem:** The contact form calls `alert()` and clears form data but never sends the message anywhere — no API call, no Firestore write, no email.

**Status:** Parked — awaiting client email address and custom domain (likely Porkbun) to set up Resend email delivery via Firebase Cloud Functions.

**Planned approach:**
1. Write form submissions to a `contactMessages` Firestore collection
2. Set up Resend (3,000 free emails/month) with domain verification
3. Create a Firebase Cloud Function triggered on new documents to send email

---

### Critical 3 — firebase.ts: No env var validation before Firebase init
**Problem:** If any `VITE_FIREBASE_*` environment variable was missing, `initializeApp()` received `undefined` values and failed at runtime with cryptic errors.

**Fix:** Added a validation loop that checks all 6 required env vars exist before calling `initializeApp()`. Throws a clear error naming the exact missing variable. Also added a `.env.example` file for developer onboarding.

**Files changed:** `src/firebase.ts`, `.env.example` (new)

---

## High Priority Fixes

### High 4 — Shop.tsx: Race condition between category state and product loading
**Problem:** Two separate `useEffect` hooks — one updating `mainCategory` from URL params, another fetching products — could race, causing products to render with stale category state.

**Fix:** Separated the effects cleanly with consistent `useEffect` style and proper dependency arrays so they no longer conflict.

**Files changed:** `src/components/Shop.tsx`

---

### High 5 — Shop.tsx: No loading/error states for Firestore product fetch
**Problem:** Products loaded from Firestore with no spinner or feedback. The UI appeared frozen during fetch. No error handling if the fetch failed.

**Fix:** Added `loading` and `error` state variables. Wrapped `loadProducts()` in try/catch/finally. Added loading message, error display with a "Try Again" button to the products grid area.

**Files changed:** `src/components/Shop.tsx`

---

### High 6 — Multiple files: `user: any` type used in 6 components
**Problem:** 6 components each defined their own local `PageProps` interface with `user: any`, causing 8 ESLint errors. Duplicated interface definitions across files.

**Fix:**
- Added a shared `PageProps` interface in `src/types.ts` using Auth0's exported `User` type from `@auth0/auth0-spa-js`
- Removed all local `PageProps` / `ShopProps` / `OrderSuccessProps` interfaces
- All 6 components now import from `types.ts`
- Header.tsx: Renamed lucide-react `User` icon import to `UserIcon` to avoid naming collision

**ESLint errors reduced:** 8 → 2 (remaining 2 are unrelated unused `id` destructures)

**Files changed:** `src/types.ts`, `src/components/About.tsx`, `src/components/CareGuide.tsx`, `src/components/Contact.tsx`, `src/components/OrderSuccess.tsx`, `src/components/Header.tsx`, `src/components/Shop.tsx`

---

### High 7 — main.tsx: Non-null assertion on root element
**Problem:** `document.getElementById('root')!` used a non-null assertion. If the root element was missing from the HTML, the app would crash with an unhelpful error.

**Fix:** Replaced with an explicit null check that throws a descriptive error message: `"Root element not found. Ensure index.html contains a <div id="root"></div>"`

**Files changed:** `src/main.tsx`

---

### High 8 — ProductModal.tsx: Brittle upload state check
**Problem:** Upload state was tracked by setting `formData.image` to the magic string `'uploading...'`, checked in 5 places. If the string was mistyped or the upload failed unexpectedly, the form would break. The image preview also tried to render `'uploading...'` as an `<img src>`.

**Fix:** Added a proper `uploading` boolean state variable. Replaced all 5 checks against the magic string with the boolean. The image field now stays clean (empty string or valid URL) throughout the upload lifecycle.

**Files changed:** `src/components/ProductModal.tsx`

---

### High 9 — Header.tsx & Shop.tsx: Hardcoded Auth0 claim URL
**Problem:** The string `'https://zenbonsai.com/roles'` was hardcoded in both `Header.tsx` and `Shop.tsx`. If the claim URL changed, both files needed updating — easy to miss one.

**Fix:** Added `AUTH0_ROLES_CLAIM` constant in `src/types.ts`. Both components now import and use the constant.

**Files changed:** `src/types.ts`, `src/components/Header.tsx`, `src/components/Shop.tsx`

---

### High 10 — ProductModal.tsx: No file size validation on image uploads
**Problem:** Users could upload arbitrarily large files to Firebase Storage with no size check, risking storage costs and slow uploads.

**Fix:** Added a `MAX_FILE_SIZE_MB = 5` constant and a size check before upload. Users get a clear alert if the file exceeds 5MB.

**Files changed:** `src/components/ProductModal.tsx`

---

## Summary

| Priority | Total | Fixed | Parked |
|----------|-------|-------|--------|
| Critical | 3 | 2 | 1 (awaiting client info) |
| High | 7 | 7 | 0 |
| **Total** | **10** | **9** | **1** |

**ESLint status:** 8 errors → 2 errors (remaining are pre-existing unused variable destructures)
**TypeScript status:** Clean compile (0 errors)
