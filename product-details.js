/** Rich copy & purchase options per product */
window.HOMELY_PRODUCT_PAGE = {
  subscriptionDiscount: 0.15,
  bundleNote:
    "Your monthly bundle ships free on the 1st of each month. Pause or skip anytime.",
  threeForOneNote: "Add any 3 qualifying units — your 4th of equal or lesser value is free.",
};

function flavourFromName(name) {
  const dash = name.indexOf(" — ");
  return dash > 0 ? name.slice(dash + 3).replace(/\s*\([^)]*\)\s*$/, "").trim() : name;
}

function segmentLabel(product) {
  const map = {
    puppy: "puppy",
    kitten: "kitten",
    adult: "adult",
    senior: "senior",
    competition: "competition & performance",
    snacks: "treat & snack",
    chews: "chew & enrichment",
    toys: "toy & enrichment",
  };
  return map[product.segment] || product.segment;
}

function defaultFeatures(product) {
  const base = [
    "No artificial colours, flavours or preservatives",
    "Vet-aware formulations for daily feeding",
  ];
  const type = product.type.toLowerCase();
  if (type.includes("dry")) {
    base.unshift("Complete & balanced dry nutrition");
    base.push("Supports muscle tone, immunity & coat health");
  } else if (type.includes("wet")) {
    base.unshift("High-moisture recipe for hydration");
    base.push("Silky texture — ideal for picky eaters");
  } else if (type.includes("snack")) {
    base.unshift("Limited-ingredient reward or topper");
    base.push("Perfect for training & positive reinforcement");
  } else if (type.includes("supplement")) {
    base.unshift("Performance nutrition support");
    base.push("Mix into meals during training seasons");
  } else {
    base.push("Designed for enrichment & daily play");
  }
  if (product.segment === "senior") base.push("Gentle on ageing joints & digestion");
  if (product.segment === "competition") base.push("Higher calories & protein for sport dogs");
  return base;
}

window.buildProductPageData = function buildProductPageData(product) {
  const flavour = flavourFromName(product.name);
  const pet = product.pet === "dog" ? "dogs" : "cats";
  const subMult = product.type.includes("Wet") ? 2 : 1;
  const unit = product.price;
  const subPrice = Math.round(unit * subMult * (1 - HOMELY_PRODUCT_PAGE.subscriptionDiscount) * 100) / 100;

  return {
    flavour,
    longDescription: [
      `Homely Pets ${flavour} is crafted for ${segmentLabel(product)} ${pet} who deserve luxury nutrition without compromise.`,
      product.desc,
      `Every pack uses our signature cream, forest green and gold packaging — the same premium standard across our full range.`,
    ].join(" "),
    features: defaultFeatures(product),
    purchaseOptions: [
      {
        id: "once",
        label: "One-time purchase",
        detail: `${product.size} · ships in 2–4 working days`,
        lineTotal: unit,
        qtyLabel: "1 pack",
        cartLabel: `${product.name} (one-time)`,
      },
      {
        id: "bundle3",
        label: "3 for 1 deal",
        detail: "Buy 3, get your 4th pack free",
        badge: "Best value",
        lineTotal: unit * 3,
        qtyLabel: "4 packs (pay for 3)",
        cartLabel: `${product.name} — 3 for 1 (4 packs)`,
      },
      {
        id: "subscribe",
        label: "Monthly subscription bundle",
        detail: HOMELY_PRODUCT_PAGE.bundleNote,
        badge: "Save 15%",
        lineTotal: subPrice,
        qtyLabel:
          product.type.includes("Wet")
            ? `2× ${product.size} / month`
            : `${subMult > 1 ? subMult + "× " : ""}${product.size} / month`,
        cartLabel: `${product.name} — monthly bundle`,
      },
    ],
    paymentMethods: [
      { id: "apple-pay", label: "Apple Pay", icon: "apple" },
      { id: "klarna", label: "Klarna", icon: "klarna" },
      { id: "amex", label: "American Express", icon: "amex" },
    ],
  };
};
