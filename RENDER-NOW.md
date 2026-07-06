# Deploy on Render — 5 clicks

Your code is on GitHub. Render is **not live yet** (that’s why the domain doesn’t work).

## Option A — Blueprint (easiest)

1. Open: **https://dashboard.render.com/blueprint/new**
2. Connect **homely-pets-store** → branch **main**
3. Click **Apply**
4. Enter when asked:
   - `STRIPE_SECRET_KEY` = `sk_test_...` (from your `.env` file)
   - `SITE_URL` = `https://www.homelypets.co.uk`
5. Wait 5 minutes → open the `.onrender.com` URL

## Option B — Manual Web Service (if Blueprint fails)

1. **https://dashboard.render.com/web/new**
2. Connect **homely-pets-store**
3. Settings:

| Field | Value |
|-------|--------|
| Name | `homely-pets-store` |
| Region | Frankfurt |
| Branch | `main` |
| Runtime | Node |
| Build Command | `npm install && npm run build:catalog` |
| Start Command | `npm start` |
| Plan | **Free** |

4. Environment → Add:
   - `STRIPE_SECRET_KEY` = your Stripe key
   - `SITE_URL` = `https://www.homelypets.co.uk`

5. **Create Web Service**

## After deploy works

1. Render → service → **Settings** → **Custom Domains**
2. Add `www.homelypets.co.uk`
3. Wait for **Verified**
4. Open **https://www.homelypets.co.uk**

## Test Render URL

When live, this should return `200`:

`https://homely-pets-store.onrender.com/api/health`
