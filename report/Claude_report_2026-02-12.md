# Bonsai Project - Codebase Audit Report
**Date:** 2026-02-12
**Branch:** refactor
**Auditor:** Claude Code (Opus 4.6)

---

## Scope

Full codebase review of `/src` with primary focus on `/src/components`. Includes terminal diagnostics from TypeScript compiler and ESLint.

---

## Terminal Diagnostics Summary

### TypeScript Compiler (`tsc --noEmit`)
- **0 errors** — Clean compile.

### ESLint (`npx eslint src/`)
- **8 errors, 0 warnings**

| File | Line | Rule | Description |
|------|------|------|-------------|
| About.tsx | 7 | `no-explicit-any` | `user: any` — needs proper type |
| CareGuide.tsx | 7 | `no-explicit-any` | `user: any` — needs proper type |
| Contact.tsx | 6 | `no-explicit-any` | `user: any` — needs proper type |
| Header.tsx | 15 | `no-explicit-any` | `user?: any \| null` — needs proper type |
| OrderSuccess.tsx | 9 | `no-explicit-any` | `user: any` — needs proper type |
| Shop.tsx | 20 | `no-explicit-any` | `user: any` — needs proper type |
| Shop.tsx | 75 | `no-unused-vars` | `id` is destructured but never used |
| Shop.tsx | 83 | `no-unused-vars` | `id` is destructured but never used |

---

## Findings by File

### 1. App.tsx
- **Unused parameter** — `isLoading` is accepted but never used in routing logic.
- **Duplicated logout callbacks** — The logout function is repeated inline 5 times across route elements. Should be extracted to a single constant.
- **No error boundary** — React Router has no error handling for failed route navigation or component crashes.

### 2. main.tsx
- **Non-null assertion risk** — `document.getElementById('root')!` will crash without a helpful error if root is missing. Should add a guard.

### 3. firebase.ts
- **No environment variable validation** — If any `VITE_FIREBASE_*` env var is undefined, Firebase will initialize with broken config and fail at runtime with unclear errors.

### 4. types.ts
- **Loose types** — `mainCategory` and `skillLevel` are plain `string` instead of string literal unions. No indication of required vs optional fields.

### 5. Contact.tsx
- **Non-functional form** — The contact form calls `alert('Message sent successfully!')` but never actually sends the message anywhere (no backend call, no email, no Firestore write). This is a broken feature.
- **No form validation** — No email format validation, no required field enforcement.
- **Should use `<form onSubmit>` pattern** instead of button `onClick`.
- **Placeholder contact details** — Phone number `(123) 456-7890` is obviously a placeholder.

### 6. ProductModal.tsx
- **Brittle upload state** — Checks `formData.image === 'uploading...'` as a string literal to determine upload state. If the async upload fails mid-way, state becomes invalid.
- **No file size validation** — Users can upload arbitrarily large files to Firebase Storage.
- **Filename collision risk** — Uses `Date.now()` for storage filenames; should use UUID for safety.
- **Silent error handling** — Upload errors go to `console.error()` with a basic alert. No retry logic.
- **Props defined inline** — Should use a named interface for component props.

### 7. Header.tsx
- **Hardcoded Auth0 claim URL** — `'https://zenbonsai.com/roles'` is hardcoded; also hardcoded in Shop.tsx. Should be a shared constant.
- **Dropdown not keyboard accessible** — Shop dropdown uses `onMouseEnter`/`onMouseLeave` only; keyboard users cannot access it.
- **Missing aria-labels** — Cart badge, menu button, search button all lack accessibility labels.
- **Missing autocomplete attribute** on search input.
- **Branding inconsistency** — Displays "Zen Oasis" but project/domain is "ZenBonsai".

### 8. Shop.tsx
- **Potential race condition** — Two `useEffect` hooks (lines 48-52 and 53-69) both react to URL changes and set state. Category state can change before products finish loading.
- **No loading state** — Products load from Firestore with no spinner or skeleton; UI appears frozen.
- **Missing memoization** — `filteredProducts` is recalculated on every render without `useMemo`. Will lag with large product sets.
- **Out of stock indicator uses green** — `bg-green-500/50` overlay for "Out of Stock" is confusing; should be red/grey.
- **Unused destructured `id`** — Destructured in two places (lines 75, 83) but never used (ESLint error).
- **No error handling** — `loadProducts()` Firestore fetch has no error handling.
- **Hardcoded skill levels** — `['beginner', 'intermediate', 'advanced']` are hardcoded; won't update if new levels are added to products.

### 9. CartSidebar.tsx
- **Decrement button UX** — Minus button is visually enabled at quantity 1; confusing since clicking it removes the item entirely.
- **Missing aria-labels** — Quantity `+`/`-` buttons and close button have no screen reader labels.
- **No memoization** — `cartTotal` recalculated every render; should use `useMemo`.
- **Empty cart** — No call-to-action to navigate back to shop when cart is empty.

### 10. OrderSuccess.tsx
- **Unsafe type assertion** — `docSnap.data() as Order` assumes correct data shape without validation.
- **Missing memoization** — Order total calculated on every render without `useMemo`.
- **Array index as key** — Uses `index` as React key for order items; can cause issues if list changes.
- **No retry mechanism** — Failed order loads show generic error with no way to retry.

### 11. About.tsx
- **Hardcoded year** — "Founded in 2023" is now outdated (current year: 2026). Should be dynamic or updated.
- **Generic alt text** — Image alt "Beautiful bonsai tree" is not descriptive enough.

### 12. CareGuide.tsx
- **`user: any` type** — Same issue as other components; needs proper Auth0 user type.
- **Missing aria-labels** on icon containers.

### 13. AdminPanel.tsx
- No significant issues. Simple, well-structured component.

---

## Configuration File Issues

### firebase.json
- **Deployment misconfiguration** — `"public": "public"` but Vite builds to `dist/`. This means `firebase deploy` will serve the wrong directory.
- **Rewrite rules** — SPA rewrite is present but doesn't exclude static asset paths.

### index.html
- **Missing SEO meta tags** — No meta description, no Open Graph tags for social previews.
- **Unverified favicon path** — References `/Bonsai.svg`; should confirm file exists in public folder.

### package.json
- **No test framework** — No test script, no testing library dependency.
- **No `.env.example`** — Project depends on environment variables but provides no template.

---

## Suggestions for Improvement

1. **Create a shared `User` type** — Define an Auth0 user interface in `types.ts` and replace all `any` usages across 6 components.
2. **Extract shared constants** — Auth0 claim URL, skill levels, branding name should be in a `constants.ts` file.
3. **Add environment variable validation** — Validate all `VITE_FIREBASE_*` vars exist at app startup before Firebase init.
4. **Implement contact form backend** — Wire up the Contact form to a Firebase Cloud Function or email service.
5. **Fix firebase.json** — Change `"public": "public"` to `"public": "dist"` for correct Vite deployment.
6. **Add error boundaries** — Wrap Router with a React error boundary component.
7. **Memoize derived data** — Use `useMemo` for `filteredProducts`, `cartTotal`, and order totals.
8. **Improve accessibility** — Add aria-labels to all icon buttons, enable keyboard navigation on dropdowns, use proper color contrast for stock indicators.
9. **Add loading/error states** — Show spinners during product fetch, provide retry buttons on failures.
10. **Add a testing setup** — Install `vitest` + `@testing-library/react` and add at least smoke tests for each component.

---

## Triage List

### CRITICAL
| # | Issue | File | Line(s) |
|---|-------|------|---------|
| 1 | firebase.json `public` set to `public` instead of `dist` — deployment broken | firebase.json | 3 |
| 2 | Contact form doesn't actually send messages — feature is non-functional | Contact.tsx | 27 |
| 3 | No env var validation — Firebase init crashes with undefined config | firebase.ts | 5-12 |

### HIGH
| # | Issue | File | Line(s) |
|---|-------|------|---------|
| 4 | Race condition between category state and product loading | Shop.tsx | 48-52 |
| 5 | No loading/error states for Firestore product fetch | Shop.tsx | 54-69 |
| 6 | `user: any` type used in 6 components — ESLint errors (8 total) | Multiple | — |
| 7 | Non-null assertion on root element with no fallback | main.tsx | 7 |
| 8 | Brittle upload state check using string literal `'uploading...'` | ProductModal.tsx | 27-28 |
| 9 | Hardcoded Auth0 claim URL duplicated in 2 files | Header.tsx, Shop.tsx | 40, 170 |
| 10 | No file size validation on image uploads | ProductModal.tsx | 197-217 |

### MEDIUM
| # | Issue | File | Line(s) |
|---|-------|------|---------|
| 11 | Missing `useMemo` on filteredProducts, cartTotal, orderTotal | Shop, CartSidebar, OrderSuccess | Various |
| 12 | Dropdown menu not keyboard accessible | Header.tsx | 73 |
| 13 | Missing aria-labels on icon buttons (6+ instances) | Multiple | Various |
| 14 | Out of stock shown with green background overlay | Shop.tsx | 256 |
| 15 | No error boundary in Router | App.tsx | 87 |
| 16 | Duplicated logout callbacks (5 instances) | App.tsx | Various |
| 17 | Unsafe type assertion `as Order` without validation | OrderSuccess.tsx | 55 |
| 18 | Missing SEO meta tags in index.html | index.html | — |
| 19 | No form validation on Contact form fields | Contact.tsx | 18 |
| 20 | Array index used as React key for order items | OrderSuccess.tsx | 148 |

### LOW
| # | Issue | File | Line(s) |
|---|-------|------|---------|
| 21 | Hardcoded "Founded in 2023" — now outdated | About.tsx | 112 |
| 22 | Branding inconsistency: "Zen Oasis" vs "ZenBonsai" | Header.tsx, Shop.tsx | Various |
| 23 | Placeholder phone number "(123) 456-7890" | Contact.tsx | 179 |
| 24 | No test framework or test scripts in project | package.json | — |
| 25 | Generic image alt text across components | About.tsx, ProductModal.tsx | Various |
| 26 | Missing `.env.example` file for developer onboarding | Project root | — |
| 27 | Loose types for `mainCategory` and `skillLevel` in types.ts | types.ts | — |
| 28 | Filename collision risk using `Date.now()` for uploads | ProductModal.tsx | 206 |
| 29 | Empty cart has no CTA to navigate back to shop | CartSidebar.tsx | 57 |

---

**Total Issues Found:** 29
- Critical: 3
- High: 7
- Medium: 10
- Low: 9
