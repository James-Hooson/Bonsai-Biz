# Stripe Integration Plan — Zen Oasis (Bonsai)

**Chosen approach:** Stripe-hosted Checkout (redirect flow) + orders persisted to Firestore.

---

## Architecture at a glance

```
CartSidebar "Proceed to Checkout"
  → Shop.handleCheckout()
    → POST Cloud Function: createCheckoutSession
        reads prices from Firestore (never trusts client)
        writes pending order doc to Firestore
        creates Stripe Checkout Session
        returns { url }
    → browser redirects to Stripe
        user pays on Stripe's hosted page
        Stripe redirects back to /success?order_id=X&session_id=Y
          → OrderSuccess page
              listens to order doc in real time (handles webhook race)

  Separately:
    Stripe → POST Cloud Function: stripeWebhook
        verifies signature
        on checkout.session.completed: flips order status → completed
```

---

## Pre-existing issue to flag

`firebase.json` currently has `"public": "public"`. Vite builds to `dist/`. This looks like a misconfiguration — verify the current production site is actually serving the app before deploying. This plan does NOT change that field; it is out of scope.

---

## New files (in creation order)

### 1. `functions/package.json`
Cloud Functions project manifest. Dependencies: `firebase-admin`, `firebase-functions` (v6, for v2 API), `stripe`. Node 20 engine. Build script: `tsc`. Main points to `lib/index.js`.

### 2. `functions/tsconfig.json`
Separate from root. `"module": "commonjs"` (Cloud Functions runtime requirement). `"outDir": "./lib"`, `"rootDir": "./src"`. Strict mode with `noUnusedLocals` and `noUnusedParameters` to match the root project.

### 3. `functions/.gitignore`
```
node_modules
lib
```

### 4. `functions/src/index.ts`
Entry point. Calls `admin.initializeApp()` (required before any Firestore ops). Re-exports `createCheckoutSession` and `stripeWebhook`.

### 5. `functions/src/createCheckoutSession.ts`
`onRequest` with `cors: true` and `secrets: [STRIPE_SECRET_KEY]`.
- Validates request is POST, body has `items[]` and `userEmail`.
- For each item: fetches the product from Firestore to get the real price. Rejects if product missing or out of stock. Builds Stripe line items in cents (`Math.round(price * 100)`).
- Writes a pending order doc to `orders` collection (status: `pending`, items with server-looked-up prices, userEmail, timestamps). `stripeSessionId` is null at this point.
- Creates Stripe Checkout Session with `mode: 'payment'`, `success_url` pointing to `/success` with `{CHECKOUT_SESSION_ID}` and the order doc ID, `cancel_url` back to `/`. Puts `orderId` in session metadata.
- Backfills `stripeSessionId` onto the order doc.
- Returns `{ url: session.url }`.
- `success_url` and `cancel_url` use `BASE_URL` env var (defaults to `http://localhost:5173` for local dev).

### 6. `functions/src/stripeWebhook.ts`
Uses an Express app passed to `onRequest` to get the **raw body** as a Buffer. This is critical — Stripe signature verification hashes the exact raw bytes Stripe sent. Firebase auto-parses JSON bodies, so re-stringifying would break signatures. Pattern:
```
const app = express()
app.use(express.raw({ type: 'application/json' }))
app.post('/', handler)
export const stripeWebhook = onRequest({ secrets: [STRIPE_WEBHOOK_SECRET] }, app)
```
Handler: calls `stripe.webhooks.constructEvent(req.body, sigHeader, secret)`. On `checkout.session.completed`: reads `orderId` from session metadata, updates that order doc to `status: 'completed'`, records `stripePaymentIntentId`. Returns 200 for all other event types (so Stripe stops retrying).

### 7. `src/components/OrderSuccess.tsx`
Route component for `/success`. Reads `order_id` from URL params. Uses `onSnapshot` (real-time listener) on `orders/{orderId}` — this handles the race between the user landing on the success page and the webhook firing. Shows "Payment Processing..." while status is `pending`, switches to "Order Confirmed" when status flips to `completed`. Displays item list and total. Has an error state if order_id is missing or doc not found. Follows the same Header/PageProps pattern as the other pages.

### 8. `.env.production`
```
VITE_FUNCTIONS_BASE_URL=https://us-central1-bonsai-new.cloudfunctions.net
```
Safe to commit (public URL, no secrets). Vite loads this automatically when `NODE_ENV=production` (i.e. during `vite build`).

---

## Existing files to modify

### `src/components/CartSidebar.tsx`
- Add `onCheckout: () => Promise<void>` to `CartSidebarProps` interface.
- Add `onCheckout` to the destructured props.
- Wire `onClick={onCheckout}` onto the "Proceed to Checkout" button (line 98 — currently dead).

### `src/components/Shop.tsx`
- Add `handleCheckout` async function (after `updateQuantity`, before `filteredProducts`). It maps cart to `{ productId, quantity }[]`, gets `userEmail` from the `user` prop, POSTs to `${import.meta.env.VITE_FUNCTIONS_BASE_URL}/createCheckoutSession`, and redirects `window.location.href` to the returned URL on success.
- Pass `onCheckout={handleCheckout}` to `<CartSidebar>`.

### `src/App.tsx`
- Import `OrderSuccess`.
- Add a `/success` route following the exact same auth-props pattern as the other routes.

### `firebase.json`
- Add a `"functions"` array block pointing to the `functions/` source directory with `nodejs20` runtime.
- No rewrite rules added — functions are called at their direct Cloud Functions URL. The existing SPA catch-all rewrite stays unchanged.

### `.env.local`
Add:
```
VITE_FUNCTIONS_BASE_URL=http://localhost:5001/bonsai-new/us-central1
```
Points to the Firebase Functions emulator in local dev.

### `.gitignore`
Add `functions/lib` (the compiled JS output directory). `node_modules` and `*.local` patterns already cover `functions/node_modules` and `functions/.env.local`.

### `.github/workflows/firebase-hosting-merge.yml`
- Add `actions/setup-node@v4` step (node 20).
- Add `cd functions && npm ci && npm run build` step after the root build.
- Add a "Deploy Cloud Functions" step after the hosting deploy: writes the existing `FIREBASE_SERVICE_ACCOUNT_BONSAI_NEW` secret to a file, sets it as `GOOGLE_APPLICATION_CREDENTIALS`, runs `npx firebase deploy --only functions --project bonsai-new`.

### `.github/workflows/firebase-hosting-pull-request.yml`
- Add `actions/setup-node@v4` step (node 20).
- Add `cd functions && npm ci && npm run build` step. Functions are NOT deployed on PRs (they are global, not per-preview-channel) — only built so the firebase.json functions reference does not cause errors.

---

## Secrets and env vars

| Name | Where | What |
|---|---|---|
| `STRIPE_SECRET_KEY` | Firebase secret manager (`firebase functions:secrets:set`) | `sk_test_…` or `sk_live_…` from Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Firebase secret manager | `whsec_…` from the webhook endpoint in Stripe dashboard |
| `BASE_URL` | Firebase Functions env config | `https://bonsai-new.web.app` in prod; `http://localhost:5173` in local dev. Used for `success_url`/`cancel_url` in the Checkout Session. |
| `VITE_FUNCTIONS_BASE_URL` | `.env.local` (dev) / `.env.production` (prod) | The Cloud Functions base URL. Baked into the frontend bundle at build time by Vite. |

Nothing with `sk_` or `whsec_` ever goes in a `VITE_` variable or a frontend file.

---

## Firestore: `orders` collection schema

```
orders/{orderId}
  status:                  "pending" | "completed"
  userEmail:               string
  items:                   [{ productId, name, quantity, unitPrice }]
  stripeSessionId:         string | null   (null briefly before session is created)
  stripePaymentIntentId:   string | null   (set by webhook)
  createdAt:               server timestamp
  updatedAt:               server timestamp
```

Firestore security rules are out of scope for this plan but must be set before go-live: users can read their own orders (match on userEmail); only the admin SDK (Cloud Functions) can write.

---

## Stripe dashboard setup (manual, one-time)

1. Copy the secret key from Stripe > Developers > API Keys.
2. Create a webhook endpoint at Stripe > Developers > Webhooks:
   - URL: `https://us-central1-bonsai-new.cloudfunctions.net/stripeWebhook`
   - Events: `checkout.session.completed`
3. Copy the webhook signing secret (`whsec_…`).
4. Set both via `firebase functions:secrets:set`.

---

## Local dev & testing

1. `npm install && cd functions && npm install`
2. Create `functions/.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_<your_test_key>
   STRIPE_WEBHOOK_SECRET=<see step 4>
   BASE_URL=http://localhost:5173
   ```
3. Start emulator: `firebase emulators:start --only functions`
4. Start Stripe CLI in a separate terminal: `stripe listen --forward-to localhost:5001/bonsai-new/us-central1/stripeWebhook`. Use the secret it prints as `STRIPE_WEBHOOK_SECRET` in step 2.
5. Start Vite: `npm run dev`
6. Test cards (test mode only):
   - Success: `4242 4242 4242 4242` / any future expiry / any CVC
   - Decline: `4000 0000 0000 0002`

---

## Verification checklist

- [ ] `cd functions && npm run build` compiles with zero errors
- [ ] Root `npm run build` (`tsc -b && vite build`) still passes
- [ ] Root `eslint src/` still passes (no new lint errors)
- [ ] Local: clicking "Proceed to Checkout" hits the emulator, redirects to Stripe test checkout
- [ ] Local: completing a test payment redirects back to `/success`, order doc appears in Firestore with status `completed`
- [ ] Local: Stripe CLI shows the webhook event was received and forwarded
- [ ] CI: both GitHub Actions workflows pass (functions build step succeeds; merge workflow deploys functions)
