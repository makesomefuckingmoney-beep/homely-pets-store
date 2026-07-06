# Homely Pets — Store

Luxury pet food storefront with **64 SKUs**, Stripe checkout, and deploy-ready custom domain support.

## Run locally (with payments)

```bash
cd homely-pets-demo
cp .env.example .env   # add STRIPE_SECRET_KEY
./start.sh
```

Open **http://localhost:4242** (Stripe checkout only works on this port).

First time only, if Node isn’t installed system-wide: `./scripts/setup-node.sh` then `./start.sh`.

Static preview only (no checkout): `python3 -m http.server 8765` → http://localhost:8765

## Live payments & domain

**Domain:** [homelypets.co.uk](https://www.homelypets.co.uk) (GoDaddy) → live store at **https://www.homelypets.co.uk**

- **GoDaddy DNS steps:** [GODADDY-DNS.md](./GODADDY-DNS.md)
- **Stripe + Render deploy:** [STRIPE-LIVE.md](./STRIPE-LIVE.md)

**Purchase alerts:** configure Pushover or Telegram in `.env` — see [NOTIFY.md](./NOTIFY.md).

## Catalog

| Category | Examples |
|----------|----------|
| **Dog · Dry** | Chicken & sweet potato, lamb, large breed, puppy, senior, duck |
| **Dog · Wet** | Salmon & pea, turkey, beef stew, puppy paté |
| **Cat · Dry** | Chicken & fish, indoor hairball, kitten |
| **Cat · Wet** | Tuna & sole, chicken broth |
| **Treats** | Dental sticks, training bites, cat crunchies, salmon cubes |
| **Supplements** | Salmon oil, probiotics, calming chews |
| **Bundles** | Starter box, multi-pet monthly, puppy welcome kit |

Product data lives in `products.js` (64 products). Server catalog: `server/products.json` (auto-built on start).

## Files

- `index.html`, `product.html`, `products.html` — pages
- `server.js` — Stripe Checkout API + static files
- `render.yaml` — Render deploy + custom domain
- `styles.css`, `products.js`, `script.js`, `cart.js` — front end
- `images/` — logo, labels, packaging

## Shopify (optional)

1. Create collections matching categories (Dog food, Cat food, Treats, etc.).
2. Import products from `products.js` (title, description, price, type).
3. Upload images from `images/` to **Files**.
