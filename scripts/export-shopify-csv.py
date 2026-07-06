#!/usr/bin/env python3
"""Export HOMELY_PRODUCTS from products.js to Shopify product import CSV."""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
products_js = (ROOT / "products.js").read_text()
labels_js = (ROOT / "labels-manifest.js").read_text()

# Parse products (simple regex — structure is stable)
blocks = re.findall(
    r'\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*pet:\s*"([^"]+)",\s*segment:\s*"([^"]+)",\s*type:\s*"([^"]+)",\s*size:\s*"([^"]+)",\s*price:\s*([\d.]+)',
    products_js,
    re.DOTALL,
)
label_map = dict(re.findall(r'"([^"]+)":\s*"labels/([^"]+)"', labels_js))

desc_map = {}
for m in re.finditer(
    r'id:\s*"([^"]+)"[^}]*?desc:\s*"((?:[^"\\]|\\.)*)"',
    products_js,
    re.DOTALL,
):
    desc_map[m.group(1)] = m.group(2).replace("\\", "")

rows = []
for pid, name, pet, segment, ptype, size, price in blocks:
    label_file = label_map.get(pid, "")
    handle = pid
    tags = f"{pet}, {segment}, {ptype.replace(' ', '-')}"
    body = desc_map.get(pid, "")
    rows.append(
        {
            "Handle": handle,
            "Title": name,
            "Body (HTML)": f"<p>{body}</p>",
            "Vendor": "Homely Pets",
            "Product Category": ptype,
            "Type": ptype,
            "Tags": tags,
            "Published": "TRUE",
            "Option1 Name": "Title",
            "Option1 Value": "Default Title",
            "Variant SKU": pid,
            "Variant Grams": "0",
            "Variant Inventory Tracker": "shopify",
            "Variant Inventory Qty": "100",
            "Variant Inventory Policy": "deny",
            "Variant Fulfillment Service": "manual",
            "Variant Price": price,
            "Variant Compare At Price": "",
            "Variant Requires Shipping": "TRUE",
            "Variant Taxable": "TRUE",
            "Image Src": f"labels/{pid}.png" if label_file else "",
            "Image Position": "1",
            "Gift Card": "FALSE",
            "SEO Title": name.split(" — ")[0] if " — " in name else name,
            "SEO Description": body[:320],
            "Status": "active",
        }
    )

out_csv = ROOT / "shopify-products-import.csv"
fields = list(rows[0].keys()) if rows else []
with out_csv.open("w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    w.writerows(rows)

print(f"Wrote {len(rows)} products to {out_csv}")
