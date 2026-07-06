/** Shared cart (persists across index + product pages) */
const HOMELY_CART_KEY = "homely-cart-v1";

function formatGBP(n) {
  if (n === 0) return "Free";
  return `£${n.toFixed(2)}`;
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(HOMELY_CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(HOMELY_CART_KEY, JSON.stringify(items));
}

function addToCart(entry) {
  const cart = getCart();
  cart.push(entry);
  saveCart(cart);
  return cart.length;
}

function getCartTotal(items = getCart()) {
  return items.reduce((sum, item) => sum + (item.lineTotal ?? item.price), 0);
}

function findProductByName(name) {
  return (window.HOMELY_PRODUCTS || []).find((p) => p.name === name);
}

function getPrice(name) {
  return findProductByName(name)?.price ?? 0;
}

function displayTitle(product) {
  const n = product.name;
  const dash = n.indexOf(" — ");
  return dash > 0 ? n.slice(0, dash) : n;
}

function productImage(product) {
  const label = window.HOMELY_LABELS?.[product.id];
  if (label) return label;
  return product.img;
}

function findProductById(id) {
  return (window.HOMELY_PRODUCTS || []).find((p) => p.id === id);
}

/** Backfill product id on older cart rows saved before Stripe */
function normalizeCartItems(items = getCart()) {
  let changed = false;
  const normalized = items.map((item) => {
    if (item.id) return item;
    const product =
      findProductByName(item.name) ||
      (item.label ? findProductByName(item.label.replace(/\s*\([^)]*\)\s*$/, "")) : null);
    if (!product) return item;
    changed = true;
    return { ...item, id: product.id, name: product.name };
  });
  if (changed) saveCart(normalized);
  return normalized;
}
