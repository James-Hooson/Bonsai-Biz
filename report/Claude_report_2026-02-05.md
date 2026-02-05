## Report — 2026-02-05 (Session 3)

### Build & Lint Output

- `tsc --noEmit` — passes with zero errors.
- `vite build` — succeeds. Single JS chunk at **623.38 kB** (threshold 500 kB). Warning still present. No code splitting in place.
- `eslint src/` — **7 errors, 0 warnings.** Full list:
  - `@typescript-eslint/no-explicit-any` — About.tsx:7, CareGuide.tsx:7, Contact.tsx:6, Header.tsx:15, Shop.tsx:20
  - `@typescript-eslint/no-unused-vars` — Shop.tsx:75, Shop.tsx:83 (destructured `id` in `handleSaveProduct`, used only to exclude from the rest spread; ESLint sees it as unused)

---

### Carry-over status — what has and has not changed since Session 2

Nothing from the Session 2 triage has been resolved. Every item flagged as Critical, High, Medium, or Low is still present at the same locations. Specific confirmations:

- CartSidebar.tsx:98 — "Proceed to Checkout" button still has no `onClick`. Dead button, unchanged.
- Shop.tsx:55,76,92 — `getDocs`, `updateDoc`, `deleteDoc` still have no `try/catch`. Unchanged.
- ProductModal.tsx:27,201,226,235,241,250,254 — sentinel string `'uploading...'` still used throughout. The preview `<img>` at line 187 still renders with `src="uploading..."` during upload.
- Shop.tsx:149 — dev comment still present, typo intact.
- Shop.tsx:193-210 — indentation block still misaligned with the rest of the file.
- Shop.tsx:48,143 — still using `React.useEffect`; line 53 uses the imported `useEffect`.
- Shop.tsx:249,251,255,259,261,267 — stray `{' '}` fragments still present.
- Shop.tsx:227 — "Out of Stock" banner still `bg-green-500/50`.
- types.ts:6-7 — `mainCategory` and `skillLevel` still plain `string`.
- ProductModal.tsx — still no file size or type validation before Firebase upload.
- App.tsx — auth props still manually threaded to all 4 routes. Same copy-paste block repeated on lines 16-27, 30-41, 44-55, 58-69.
- About.tsx:6-12, CareGuide.tsx:6-12, Contact.tsx:5-11 — `PageProps` still duplicated identically in all three.
- Contact.tsx:221 — "Get Directions" still links to `https://maps.google.com` (homepage, not a location).
- Contact.tsx:27 — form still just shows an alert, no actual submission.
- Header.tsx:58-70 — hand-rolled chevron SVG, `ChevronDown` from lucide-react not used.
- Header.tsx:223-251 — mobile menu still a flat list, no category sub-menu.

---

### New findings this session

**Contact.tsx — form structure is broken (lines 67-135)**
There is no `<form>` element. The inputs live inside a `<div className="space-y-4">`. The submit button (line 128) calls `handleSubmit` via `onClick`. That handler is typed as `(e: React.FormEvent) => void` but receives a click event, not a form event. The `e.preventDefault()` on line 26 is a no-op — there is no form submission to prevent. When the real submission is wired up, this will need to be restructured as an actual `<form>` with `onSubmit`. Compounds the existing "form doesn't submit" issue.

**Contact.tsx — placeholder content (lines 178-183, 217-218)**
Phone number is `(123) 456-7890` and address is `123 Bonsai Lane, Green City, GC 12345`. These are clearly dummy values. The phone `tel:` link and the address text will mislead users on a live site.

**Header.tsx — `user` prop type collapses (line 15)**
Typed as `any | null`. The union with `null` is meaningless — `any` already absorbs it. Should be a concrete user type or at minimum `unknown | null`.

**About.tsx — hardcoded external image with no fallback (line 130)**
The "Our Story" section image is a direct Unsplash URL. If that URL is removed or rate-limited, the image silently disappears. No `onerror` fallback or placeholder.

**Shop.tsx — ESLint unused-var on destructured `id` (lines 75, 83)**
`const { id, ...productData } = product` is used to strip `id` from the payload before sending to Firestore. The `id` variable itself is never referenced — `product.id` is used instead on line 76. ESLint flags it. Fix is either `{ id: _, ...productData }` or use the destructured `id` directly.

---

### Triage

**Critical**
- CartSidebar.tsx:98 — "Proceed to Checkout" button has no `onClick` handler. Completely dead. Most visible user-facing bug. *(carry-over, unfixed since Session 2)*
- Shop.tsx:55,76,92 — No error handling on any Firestore calls. `getDocs`, `updateDoc`, `deleteDoc` are all unwrapped. A network failure or permission error will crash the component with no recovery. *(carry-over, unfixed since Session 2)*

**High**
- ProductModal.tsx — Sentinel string `'uploading...'` used as upload state in the `image` field. Renders a broken `<img src="uploading...">` during upload. Replace with a dedicated `isUploading` boolean and guard the preview. *(carry-over, unfixed since Session 2)*
- Bundle size 623 kB — over the 500 kB Vite threshold. No route-level code splitting. Lazy-loading About, CareGuide, Contact, and Shop via `React.lazy` / `import()` would fix this. *(carry-over, unfixed since Session 2)*
- App.tsx — Auth props (`user`, `isAuthenticated`, `isLoading`, `onLogin`, `onLogout`) copy-pasted into all 4 routes. An Auth Context or a layout wrapper route would eliminate this entirely. *(carry-over from Session 1)*

**Medium**
- ESLint — 7 errors currently failing. 5 are `any` types in `PageProps` and `user` props. 2 are unused destructured `id` in Shop.tsx. All straightforward fixes. *(new this session)*
- types.ts:6-7 — `mainCategory` and `skillLevel` are plain `string`. Should be union literal types (`'bonsai' | 'houseplants' | 'tanks'` and `'beginner' | 'intermediate' | 'advanced'`) to match the select options in ProductModal and catch mismatches at compile time. *(carry-over, unfixed since Session 2)*
- ProductModal.tsx — No file size or type validation before the upload hits Firebase Storage. A 50 MB PNG will go straight through. *(carry-over, unfixed since Session 2)*
- About.tsx:6-12, CareGuide.tsx:6-12, Contact.tsx:5-11 — `PageProps` defined identically in three files. Extract to a shared location. *(carry-over from Session 1)*
- Contact.tsx:67-135 — No `<form>` element. Submit handler is typed as `FormEvent` but wired to a click. `e.preventDefault()` is a no-op. Needs restructuring when real submission is added. *(new this session)*
- About.tsx:130 — Unsplash image URL hardcoded, no fallback on failure. *(new this session)*

**Low**
- Contact.tsx:178-183, 217-218 — Phone and address are placeholder values. Will mislead users on a live site. *(new this session)*
- Shop.tsx:20 — `user: any`. Needs a proper type. *(carry-over, unfixed since Session 2)*
- Shop.tsx:38 — `mainCategory` filters products but has no UI to change it — only settable via URL params from the Header dropdown. Clarify if intentional or add a category bar alongside the skill level filter. *(carry-over, unfixed since Session 2)*
- Shop.tsx:193-210 — Skill level filter block is not indented to match the surrounding JSX. *(carry-over, unfixed since Session 2)*
- Shop.tsx:48,143 vs 53 — Mixed `React.useEffect` and imported `useEffect`. Pick one. *(carry-over, unfixed since Sessions 1 & 2)*
- Shop.tsx:249,251,255,259,261,267 — Stray `{' '}` whitespace fragments in product card. *(carry-over, unfixed since Session 2)*
- Shop.tsx:149 — Dev comment with typo left in. Remove or convert to a proper TODO. *(carry-over, unfixed since Session 2)*
- Shop.tsx:227 — "Out of Stock" banner uses `bg-green-500/50`. Semantically wrong for an out-of-stock state. *(carry-over, unfixed since Sessions 1 & 2)*
- Header.tsx:15 — `user` typed as `any | null`, which collapses to `any`. *(new this session)*
- Header.tsx:58-70 — Hand-rolled chevron SVG. `ChevronDown` from lucide-react is already a dependency. *(carry-over from Session 1)*
- Header.tsx:223-251 — Mobile menu is a flat nav list. Desktop has a Shop category dropdown; mobile does not. *(carry-over from Session 1)*
- About.tsx, CareGuide.tsx, Contact.tsx — `isLoading` is in `PageProps` but none of these three components use it. Only Shop gates on it. *(carry-over from Session 1)*
