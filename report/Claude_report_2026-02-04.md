## Initial Report — 2026-02-04 (Session 1)

### Issues found

**Cross-Cutting (App.tsx + all pages)**
- Auth props are manually threaded to every route. `user`, `isAuthenticated`, `isLoading`, `onLogin`, `onLogout` are copy-pasted into every `<Route>` in App.tsx, and every page component accepts them just to pass them into `<Header>`. An Auth Context (or a layout wrapper route) would eliminate all of this boilerplate.
- `PageProps` is defined identically in 3 files — About.tsx:6-12, CareGuide.tsx:6-12, and Contact.tsx:5-11. Should live in one shared place.
- `isLoading` is in PageProps but never used by About, CareGuide, or Contact. Only Shop actually gates on it.

**Header.tsx**
- Most props are optional, which makes the component behave differently depending on who renders it. The cart button and login button both have `if prop exists → button, else → Link` branching (Header.tsx:145-163, 187-204). This is fragile.
- The chevron SVG on the Shop dropdown (Header.tsx:58-70) is hand-rolled while everything else uses lucide-react — `ChevronDown` would be consistent.
- The mobile menu is a flat list with no category dropdown. It's inconsistent with desktop nav.

**Shop.tsx**
- 680 lines, one component doing everything. Product fetching, filtering, cart state, admin CRUD, and the product modal are all in here. The cart sidebar and product grid could be their own components.
- Inconsistent `useEffect` usage. Lines 61 and 160 use `React.useEffect`, line 66 uses the imported `useEffect`. Pick one.
- `selectedCategory` is actually the skill level filter. It coexists with `mainCategory` and the naming makes the two confusing to distinguish at a glance.
- Image upload state uses a sentinel string `'uploading...'` (Shop.tsx:611, 636, 651, 660, 664). A separate `isUploading` boolean would be cleaner and less error-prone.
- "Out of Stock" banner is green (Shop.tsx:259). `bg-green-500/50` is semantically wrong for an out-of-stock indicator.
- Stray `{' '}` fragments scattered through the product card JSX (lines 281, 283, 287, 291, 293, 299) — formatting artifacts, should be cleaned up.
- No error handling on the Firestore fetch in `loadProducts` (Shop.tsx:67-81). If that call fails, the component just silently shows no products.

**CareGuide.tsx**
- The 4 care cards (CareGuide.tsx:52-113) are structurally identical — same layout, icon circle, heading, paragraph. Good candidate to map over a data array instead of repeating the JSX 4 times.

**Contact.tsx**
- The form doesn't actually submit anything (Contact.tsx:25-29). It just shows an alert. Known TODO.
- "Get Directions" links to maps.google.com (the homepage), not an actual location (Contact.tsx:221).

### Triage

**Critical**
- Shop.tsx — 680 lines, single component handling everything. Needs decomposition into smaller components.
- Shop.tsx — No error handling on Firestore fetch in `loadProducts`. Silent failure, zero products shown if it fails.

**High**
- Auth props manually threaded to every route. Needs Auth Context or layout wrapper.
- Contact.tsx — form doesn't submit anything. Core functionality is missing.
- Contact.tsx — "Get Directions" links to maps.google.com homepage, not an actual location.

**Medium**
- `PageProps` duplicated across 3 files. Needs to be shared.
- Shop.tsx — sentinel string `'uploading...'` used as upload state. Should be a boolean.
- CareGuide.tsx — 4 identical care cards repeated in JSX. Should map over a data array.

**Low**
- `isLoading` in PageProps unused by About, CareGuide, Contact.
- Shop.tsx — inconsistent `useEffect` usage (React.useEffect vs imported).
- Shop.tsx — `selectedCategory` naming is confusing alongside `mainCategory`.
- Shop.tsx — "Out of Stock" banner uses green. Semantically wrong.
- Shop.tsx — stray `{' '}` fragments in product card JSX.
- Header.tsx — hand-rolled chevron SVG instead of lucide-react `ChevronDown`.
- Header.tsx — mobile menu missing category dropdown, inconsistent with desktop.

---

## Update — 2026-02-04 (Session 2)

### What's been done since last report
Shop.tsx has been decomposed. CartSidebar, ProductModal, and AdminPanel are now their own files. types.ts has been extracted. The 680-line monolith is now ~307 lines. Good progress.

### Remaining issues in the new component files

**Shop.tsx**
- Inconsistent indentation — skill level filter block (lines 193-210) doesn't match the rest of the file.
- Mixed useEffect usage — lines 48 and 143 use `React.useEffect`, line 53 uses the imported `useEffect`. Still present from last report.
- Stray `{' '}` whitespace artifacts still in the product card JSX (lines 249, 251, 255, 259, 261, 267).
- Dev comment left in at line 149: `"maybe change to add something fun liek as bonsai tree swaying"` — typo, remove or convert to a proper TODO.
- No error handling on Firestore calls — `getDocs`, `updateDoc`, `deleteDoc` have no try/catch. A failure will crash the component. Still present from last report.
- `user: any` on line 20 — loose typing, should be typed properly.
- `mainCategory` state exists and filters products, but there is no visible UI to change it. It's only settable via URL params. Either add a UI or clarify if this is intentional.
- "Out of Stock" banner is still green (`bg-green-500/50`) — flagged last report, not yet fixed.

**CartSidebar.tsx**
- "Proceed to Checkout" button (line 98) has no `onClick` handler. It is completely dead. This is the single most visible user-facing bug.

**ProductModal.tsx**
- Upload state uses sentinel string `'uploading...'` in the `image` field (lines 27, 201, 226). A separate `isUploading` boolean is cleaner. Flagged last report under Shop.tsx, carried over.
- During upload, the image preview `<img>` (line 187) will render with `src="uploading..."` — broken image flash before the check on line 186 can hide it cleanly.
- No file size or type validation before the upload hits Firebase Storage.

**types.ts**
- `mainCategory` and `skillLevel` are plain `string`. Should be union literal types (e.g. `'bonsai' | 'houseplants' | 'tanks'`) to catch mismatches at compile time and match the select options in ProductModal.

### Build output (Session 2)
- `tsc -b && vite build` — passes with zero errors, zero warnings from TypeScript.
- Vite flags the output JS bundle at 623 kB (threshold is 500 kB). The app is shipping as a single chunk. Route-level code splitting (lazy imports on About, CareGuide, Contact, Shop) would bring this down.

### Triage

**Critical**
- CartSidebar.tsx — "Proceed to Checkout" button has no `onClick` handler. Completely dead. Most visible user-facing bug.
- Shop.tsx — No error handling on Firestore calls (`getDocs`, `updateDoc`, `deleteDoc`). A failure will crash the component.

**High**
- ProductModal.tsx — Sentinel string `'uploading...'` used as upload state in the `image` field. Causes a broken image flash during upload. Replace with an `isUploading` boolean.
- Bundle size at 623 kB — over the 500 kB threshold. Route-level code splitting would fix this.

**Medium**
- types.ts — `mainCategory` and `skillLevel` are plain `string`. Should be union literal types to catch mismatches at compile time.
- ProductModal.tsx — No file size or type validation before upload hits Firebase Storage.
- Shop.tsx — `mainCategory` filters products but has no UI to change it. Only settable via URL params. Clarify if intentional or add UI.
- Shop.tsx — `user: any` on line 20. Needs proper typing.

**Low**
- Shop.tsx — Inconsistent indentation in skill level filter block (lines 193-210).
- Shop.tsx — Mixed `useEffect` usage — `React.useEffect` vs imported `useEffect`.
- Shop.tsx — Stray `{' '}` whitespace artifacts in product card JSX.
- Shop.tsx — Dev comment left in at line 149. Remove or convert to TODO.
- Shop.tsx — "Out of Stock" banner still using `bg-green-500/50`. Semantically wrong.