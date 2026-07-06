#!/usr/bin/env node
/** Build server/products.json from products.js for Stripe price validation */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "products.js"), "utf8");
const blocks = [...src.matchAll(
  /id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?type:\s*"([^"]+)"[\s\S]*?price:\s*([\d.]+)/g
)];

const products = blocks.map((m) => ({
  id: m[1],
  name: m[2],
  type: m[3],
  price: parseFloat(m[4]),
}));

const out = path.join(root, "server", "products.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(products, null, 2));
console.log(`Built ${products.length} products → server/products.json`);
