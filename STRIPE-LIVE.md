# Live Stripe checkout

Homely Pets uses **Stripe Checkout** for real payments (cards, Apple Pay, Klarna when enabled in your Stripe account).

## 1. Stripe account

1. Sign up at [stripe.com](https://stripe.com) and complete business verification for **live** payments.
2. Open [API keys](https://dashboard.stripe.com/apikeys) and copy your **live** secret key (`sk_live_…`).

## 2. Configure the store

```bash
cd homely-pets-demo
cp .env.example .env
```

Edit `.env`:

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxx
SITE_URL=https://your-domain.com
PORT=4242
```

- **Never** commit `.env` or share your secret key.
- `SITE_URL` must match the URL customers use (required for Stripe redirect URLs).

## 3. Run locally

```bash
npm install
npm start
```

Open [http://localhost:4242](http://localhost:4242), add items to your bag, and click **Checkout securely**.

## 4. Payment methods

In [Stripe Dashboard → Settings → Payment methods](https://dashboard.stripe.com/settings/payment_methods), enable:

- **Cards**
- **Apple Pay** (domain verification required for production)
- **Klarna** (UK)

Checkout uses `automatic_payment_methods` so eligible methods appear automatically.

## 5. Deploy on Render (recommended)

This repo includes **`render.yaml`** for one-click deploy.

1. Push `homely-pets-demo` to a **GitHub** repository.
2. Go to [Render](https://render.com) → **New** → **Blueprint** → connect the repo.
3. When prompted, set:
   - `STRIPE_SECRET_KEY` = your live key (`sk_live_…`)
   - `SITE_URL` = `https://homely-pets-store.onrender.com` for now (update after domain is connected)
4. Click **Apply**. Wait for the deploy to finish.
5. Open your `*.onrender.com` URL and test checkout.

Manual deploy (any host):

| Setting | Value |
|---------|--------|
| Build | `npm install && npm run build:catalog` |
| Start | `npm start` |
| Health check | `/api/health` |

Render sets `PORT` automatically — do not hard-code it in production.

## 6. Connect your domain

After Render deploy is live:

### Step A — Add domain in Render

1. Render → your service → **Settings** → **Custom Domains**.
2. Add **`www.yourdomain.com`** (recommended primary).
3. Optionally add **`yourdomain.com`** (root) — Render shows redirect to `www`.
4. Copy the DNS records Render displays (they are specific to your service).

### Step B — DNS at your registrar

Replace `yourdomain.com` and `homely-pets-store.onrender.com` with your real names.

| Type | Host / Name | Value | TTL |
|------|-------------|-------|-----|
| **CNAME** | `www` | `homely-pets-store.onrender.com` | 3600 (or Auto) |
| **ALIAS** or **ANAME** | `@` | `homely-pets-store.onrender.com` | 3600 |

If your registrar **does not support ALIAS/ANAME** on the root (`@`):

| Type | Host / Name | Value |
|------|-------------|-------|
| **A** | `@` | Use the IP Render shows for root domains, **or** |
| **Redirect** | `@` → `https://www.yourdomain.com` | Enable “forward root to www” in registrar settings |

**Common registrars**

- **GoDaddy** — DNS → Add `CNAME` `www` → Render hostname. Use “Forwarding” for root → `https://www.yourdomain.com`.
- **Namecheap** — Advanced DNS → `CNAME Record` for `www`. URL Redirect for `@`.
- **Cloudflare** — DNS → `CNAME` `www` → Render (proxy **DNS only**, grey cloud, until SSL is verified). Root: `CNAME` `@` to Render if your plan allows, else redirect rule.
- **123-reg / Ionos UK** — Same pattern: `www` CNAME to Render; root forward to `www`.

DNS can take **5 minutes to 48 hours** to propagate (usually under 1 hour).

### Step C — HTTPS & env vars

1. In Render, wait until the domain shows **Verified** with a certificate.
2. Update **`SITE_URL`** in Render env vars to your live URL, e.g. `https://www.yourdomain.com` (no trailing slash).
3. **Redeploy** or restart the service so Stripe redirect URLs use the new domain.

### Step D — Stripe Apple Pay (optional)

1. [Stripe → Payment method domains](https://dashboard.stripe.com/settings/payment_method_domains)
2. Add `www.yourdomain.com`
3. Complete domain verification (Stripe provides a file or DNS TXT record)

### Checklist

- [ ] Site loads at `https://www.yourdomain.com`
- [ ] `SITE_URL` matches that exact URL
- [ ] Add to bag → Checkout → Stripe page opens
- [ ] Success page returns to `checkout-success.html` on your domain
- [ ] Apple Pay domain verified (if using Apple Pay)

## Security

- Prices are validated **server-side** from `server/products.json` (rebuilt from `products.js` on start).
- The browser only sends product `id` and purchase `option`; line totals are computed on the server.

## Static preview only

`python3 -m http.server` serves the shop UI but **cannot** process payments. Always use `npm start` for checkout.
