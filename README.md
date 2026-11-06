# Zen Oasis

Online shop for bonsai, plants, aquascaping supplies and Japanese art, live at [zenoasis.co.nz](https://zenoasis.co.nz).

React + Vite + Tailwind front end, hosted on Firebase. Cloud Functions handle checkout (Stripe), order emails (Gmail) and admin login (Auth0 → Firebase Auth). Products, orders and editable page text live in Firestore; product images in Firebase Storage.

## Running locally

Requires Node 22 (see `.nvmrc`).

```bash
npm install
npm --prefix functions install
cp .env.example .env.development.local   # then fill in the values
npm run dev
```

Checkout only works against the live domain, so test it on zenoasis.co.nz.

## Configuration

**Front end** (`.env.development.local` locally, `.env.production` for builds):

| Variable | Purpose |
| --- | --- |
| `VITE_FIREBASE_*` | Firebase web app config for project `bonsai-new` |
| `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID` | Auth0 app used for admin login |
| `VITE_FUNCTIONS_BASE_URL` | Base URL of the deployed Cloud Functions |

**Functions** (`functions/.env.bonsai-new`): `BASE_URL` (the site's origin, used for CORS and Stripe redirects), `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`.

**Secrets** (set with `firebase functions:secrets:set <NAME>`, never committed):

| Secret | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhook calls to `stripeWebhook` |
| `GMAIL_APP_PASSWORD` | App password for zenoasisnz@gmail.com, which sends all emails |

## Deploying

Pushing to `main` runs the GitHub Action in `.github/workflows/firebase-hosting-merge.yml`: it runs the tests, builds, then deploys hosting and Cloud Functions. Pull requests get a preview channel.

Firestore and Storage rules are **not** deployed by the workflow. After changing them:

```bash
firebase deploy --only firestore:rules,storage
```

## How it fits together

- **Checkout:** the cart calls `createCheckoutSession`, which checks and reserves stock, creates a pending order and redirects to Stripe. `stripeWebhook` marks the order paid (`completed`), saves the delivery address and sends the emails. If the customer abandons or the session expires, `cancelCheckout` or the expiry webhook returns the reserved stock.
- **Emails:** sent from and to zenoasisnz@gmail.com (`functions/src/email.ts`). The shop's copy has reply-to set to the customer, so replying goes straight to them.
- **Admin login:** `/admin` redirects to Auth0. The Auth0 ID token is exchanged for a Firebase custom token by `mintFirebaseToken`, which is what Firestore and Storage rules check.
- **Editable page text:** About, Care Guide and Aquascaping copy has defaults in code; admin edits are stored in Firestore `pageContent/{page}` and override them field by field.

## Gotchas

- **Admin emails are listed in three places:** `src/types.ts` (`ADMIN_EMAILS`), `firestore.rules` and `storage.rules`. Change all three, then deploy the rules.
- **The delivery fee ($15 NZD) and delivery area are in two places:** `src/components/CartSidebar.tsx` and `functions/src/createCheckoutSession.ts`. Keep the Terms page in step too.
- **Product categories** are a fixed list in two places: `src/components/Shop.tsx` (labels and filter) and `src/components/ProductModal.tsx` (the admin dropdown).
- **Auth0** is managed by the developer; the client does not have access to it.
- `index.html` redirects Firebase's default domains (`bonsai-new.web.app`, `bonsai-new.firebaseapp.com`) to zenoasis.co.nz, because checkout only allows that origin. PR preview channels are left alone.

## Tests

```bash
npm test                    # front end (Vitest)
npm --prefix functions test # Cloud Functions
```
