/** Server-side line totals — must match product-details.js logic */
const SUBSCRIPTION_DISCOUNT = 0.15;

function lineForProduct(product, option = "once") {
  const unit = product.price;
  if (option === "bundle3") {
    return {
      name: `${product.name} — 3 for 1 (4 packs)`,
      unitAmount: Math.round(unit * 3 * 100),
      quantity: 1,
    };
  }
  if (option === "subscribe") {
    const mult = product.type.toLowerCase().includes("wet") ? 2 : 1;
    const total = unit * mult * (1 - SUBSCRIPTION_DISCOUNT);
    return {
      name: `${product.name} — monthly bundle`,
      unitAmount: Math.round(total * 100),
      quantity: 1,
    };
  }
  return {
    name: product.name,
    unitAmount: Math.round(unit * 100),
    quantity: 1,
  };
}

module.exports = { lineForProduct };
