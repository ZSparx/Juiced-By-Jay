# Juiced By Jay store

Next.js (App Router) storefront with Supabase for products and orders and Square for payments.

## How it works

- Products, prices and order records live in Supabase (`products`, `orders`, `order_items`).
- The browser cart only stores `{slug, qty, ginger}`. At checkout the server re-prices everything from the database, so a tampered cart can't change what is charged.
- Checkout saves a pending order, creates a Square payment link, and sends the shopper to Square's hosted payment page.
- Square calls `/api/webhooks/square` when the payment completes, and the order is marked paid.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

## Environment variables

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project (already filled in the example) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API (publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page. **Secret**: server only, never in browser code |
| `NEXT_PUBLIC_SITE_URL` | Your live URL (for example `https://juicedbyjay.com`) |
| `SQUARE_ENVIRONMENT` | `sandbox` while testing, `production` when live |
| `SQUARE_ACCESS_TOKEN` | Square Developer Dashboard > your app > Credentials |
| `SQUARE_LOCATION_ID` | Square Developer Dashboard > Locations |
| `SQUARE_WEBHOOK_URL` | The exact URL of your webhook, e.g. `https://yoursite.com/api/webhooks/square` |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Square Developer Dashboard > Webhooks > your subscription |
| `DELIVERY_FEE_CENTS` | Delivery fee in cents (0 = free) |
| `FREE_DELIVERY_MIN_CENTS` | Subtotal in cents for free delivery (0 = off). Also shows in the top banner |
| `TAX_PERCENT` | Sales tax percent, e.g. `8.25`. Confirm the right rate with your accountant |

## Set up Square

1. Create an app at developer.squareup.com and use the **Sandbox** credentials first.
2. Add a webhook subscription for the `payment.updated` event pointing at your `/api/webhooks/square` URL. Copy its signature key into the env vars.
3. Place a test order with Square's sandbox test card, then check that the order shows `paid` in Supabase.
4. To go live: switch to production credentials, set `SQUARE_ENVIRONMENT=production`, and place one real small order.

## Deploy on Vercel

1. Push this folder to a GitHub repository and import it in Vercel.
2. Add every variable above in Project Settings > Environment Variables.
3. Add your domain, set `NEXT_PUBLIC_SITE_URL` and `SQUARE_WEBHOOK_URL` to it, and redeploy.

## Managing the menu

Change prices, names or availability in the Supabase `products` table (set `active = false` to hide an item). The ginger add-on is the row with slug `ginger`. Long-form copy and photos for each juice are in `lib/content.ts`; a brand-new juice also needs an entry there and photos in `public/images`.

## Known gaps

- No order emails yet (Square sends receipts).
- Delivery zones are not enforced; any address is accepted.
- No admin screen: view and update orders in the Supabase table editor.
- Privacy, Terms, Delivery and Returns pages still need to be written.
