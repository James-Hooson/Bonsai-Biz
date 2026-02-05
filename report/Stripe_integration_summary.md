# Stripe Integration Summary

## New Files Created

### Cloud Functions (backend)
- `functions/package.json` - Dependencies and Node 20 config
- `functions/tsconfig.json` - TypeScript config for CommonJS
- `functions/.gitignore`
- `functions/src/index.ts` - Entry point
- `functions/src/createCheckoutSession.ts` - Creates Stripe checkout sessions
- `functions/src/stripeWebhook.ts` - Handles Stripe webhook events

### Frontend
- `src/components/OrderSuccess.tsx` - Order confirmation page
- `.env.production` - Production functions URL

## Modified Files
- `src/components/CartSidebar.tsx` - Added `onCheckout` prop
- `src/components/Shop.tsx` - Added `handleCheckout` function
- `src/App.tsx` - Added `/success` route
- `firebase.json` - Added functions config
- `.gitignore` - Added `functions/lib`
- `.github/workflows/firebase-hosting-merge.yml` - Builds and deploys functions
- `.github/workflows/firebase-hosting-pull-request.yml` - Builds functions on PR

## Next Steps (manual)
1. Set Firebase secrets: `firebase functions:secrets:set STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
2. Set `BASE_URL` env config for functions
3. Create Stripe webhook endpoint pointing to `https://us-central1-bonsai-new.cloudfunctions.net/stripeWebhook`
4. Create `.env.local` with `VITE_FUNCTIONS_BASE_URL=http://localhost:5001/bonsai-new/us-central1` for local dev
