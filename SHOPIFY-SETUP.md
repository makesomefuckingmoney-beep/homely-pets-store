# Adding Homely Pets to Shopify

Yes — you can use everything from this project on Shopify. The demo site is **not** uploaded as one file; you import **products**, **images**, and **brand assets** into Shopify separately.

## What you already have

| Asset | Location |
|-------|----------|
| 64 product labels (images) | `images/labels/` or `Homely-Pets-All-Labels-Updated.zip` |
| Product data (names, prices, descriptions) | `products.js` → **`shopify-products-import.csv`** |
| Logo & supplier pack | `supplier-pack/01-logo/`, supplier zip |
| Brand colours | `supplier-pack/BRAND-SCHEME.md` |

## Step 1 — Upload images to Shopify

1. **Shopify Admin** → **Content** → **Files**
2. Upload all PNGs from `01-all-product-labels/` (or create a folder `labels/` in Files).
3. After upload, each file gets a CDN URL. For bulk import, you can:
   - Import products first with CSV (Step 2), then assign images per product in Admin, **or**
   - Use an app like **Matrixify / Excelify** to import CSV + images together.

**Tip:** Name files match the CSV (`dog-adult-dry-chicken-2.png`) so pairing is easy.

## Step 2 — Import products (CSV)

1. Run (or use the file already generated):
   ```bash
   python3 scripts/export-shopify-csv.py
   ```
2. **Shopify Admin** → **Products** → **Import**
3. Upload `shopify-products-import.csv`
4. Map columns if prompted → Import

Then attach the matching image to each product (if URLs were not in CSV).

## Step 3 — Theme & branding

- **Logo:** Settings → Brand → upload `homely-pets-logo-primary.png`
- **Colours:** Theme customizer → match moss `#273A2D`, sage `#3F5C46`, gold `#B88A3B`, cream `#F8F4EC`
- **Fonts:** Cormorant Garamond (headings) + Outfit or similar (body) — available in many Shopify themes

Popular themes for pet/luxury brands: **Dawn**, **Refresh**, **Prestige**, **Impulse** (paid).

## Step 4 — Features from the demo

| Demo feature | On Shopify |
|--------------|------------|
| Apple Pay, Klarna, Amex | **Settings → Payments** — enable Shop Pay, Klarna, etc. |
| 3 for 1 deal | App: **BOGO+**, **Bold Bundles**, or **Shopify Bundles** |
| Monthly subscription | **Shopify Subscriptions** (if eligible) or **Recharge**, **Appstle** |
| Product pages | Built-in product template + your images & descriptions |
| Collections (Dogs / Cats) | **Products → Collections** — automated rules: tag contains `dog` or `cat` |

## Step 5 — Optional: use the HTML demo as reference only

The files `index.html`, `product.html`, `styles.css` are a **design reference**, not a Shopify theme. To match the look closely you would either:

- Customize a Shopify theme in the editor, or  
- Hire a developer to build a custom theme from `styles.css`, or  
- Use **Shopify Sections** / page builder apps.

## Checklist

- [ ] Images uploaded to Files  
- [ ] Products imported from CSV  
- [ ] Image assigned to each product  
- [ ] Collections: Dogs, Cats, Puppy, Adult, etc.  
- [ ] Payments: Shop Pay, Klarna, cards  
- [ ] Subscription app (if needed)  
- [ ] BOGO / bundle app for 3-for-1  
- [ ] Shipping rates & UK delivery rule  
- [ ] Domain connected  

## Need help?

Regenerate CSV anytime after editing `products.js`. Re-run `scripts/update-all.sh` after label changes, then re-upload images.
