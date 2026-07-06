# GoDaddy DNS — homelypets.co.uk

Connect your GoDaddy domain to the Homely Pets store on Render.

**Your domain:** `homelypets.co.uk`  
**Store URL (use this everywhere):** `https://www.homelypets.co.uk`

---

## Step 1 — Deploy on Render first

1. Push `homely-pets-demo` to GitHub.
2. [Render](https://render.com) → **New** → **Blueprint** → connect the repo.
3. Set environment variables:
   - `STRIPE_SECRET_KEY` = your Stripe secret key
   - `SITE_URL` = `https://www.homelypets.co.uk`
4. Wait until the service is live at `https://homely-pets-store.onrender.com`.

---

## Step 2 — Add domain in Render

1. Render → **homely-pets-store** → **Settings** → **Custom Domains**.
2. Click **Add custom domain** → enter `www.homelypets.co.uk`.
3. Render shows DNS records — keep this tab open.

---

## Step 3 — GoDaddy DNS records

1. Log in at [godaddy.com](https://www.godaddy.com).
2. **My Products** → **homelypets.co.uk** → **DNS** (or **Manage DNS**).
3. Add or edit these records:

### `www` (your live shop)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **CNAME** | `www` | `homely-pets-store.onrender.com` | 1 Hour (default) |

- If a old `www` A record exists, **delete it** first.
- Only one `www` record should point to Render.

### Root `@` (homelypets.co.uk without www)

GoDaddy does not support CNAME on `@` the same way. Use **forwarding**:

1. GoDaddy → domain → **Forwarding** (or **Domain** → **Forward domain**).
2. Forward `homelypets.co.uk` → `https://www.homelypets.co.uk`
3. Choose **Permanent (301)**.
4. Turn on **Forward only** (recommended).

---

## Step 4 — Wait for SSL

- DNS can take **15 minutes to 48 hours** (often under 1 hour).
- In Render, wait until `www.homelypets.co.uk` shows **Verified** with a certificate.

---

## Step 5 — Stripe & env check

1. Confirm Render `SITE_URL` = `https://www.homelypets.co.uk` (no trailing slash).
2. [Stripe → Payment method domains](https://dashboard.stripe.com/settings/payment_method_domains) → add `www.homelypets.co.uk` for Apple Pay.
3. [Stripe → Webhooks](https://dashboard.stripe.com/webhooks) (optional but recommended):
   - URL: `https://www.homelypets.co.uk/api/stripe-webhook`
   - Event: `checkout.session.completed`
   - Add `STRIPE_WEBHOOK_SECRET` to Render env vars.

---

## Step 6 — Test

- [ ] `https://www.homelypets.co.uk` loads the shop
- [ ] `https://homelypets.co.uk` redirects to `www`
- [ ] Add to bag → Checkout → Stripe opens
- [ ] Success page returns to your domain
- [ ] `https://www.homelypets.co.uk/track.html` works

---

## Troubleshooting (GoDaddy)

| Problem | Fix |
|---------|-----|
| Site not loading | Wait for DNS; check CNAME `www` points to `homely-pets-store.onrender.com` |
| SSL pending in Render | Remove conflicting `www` A records in GoDaddy |
| Checkout redirects to localhost | Update `SITE_URL` on Render to `https://www.homelypets.co.uk` |
| “Parked” GoDaddy page | Turn off GoDaddy Website Builder / parking for this domain |

---

## Local development

Keep `.env` on your Mac as:

```env
SITE_URL=http://localhost:4242
```

Use `https://www.homelypets.co.uk` only on Render (production).
