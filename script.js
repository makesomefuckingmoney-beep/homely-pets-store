let activeCategory = "all";
let cartUI = null;

const menuToggle = document.getElementById("menu-toggle");
const nav = document.querySelector(".nav");

function petLabel(pet) {
  if (pet === "both") return "Dogs & cats";
  if (pet === "dog") return "Dog";
  return "Cat";
}

function productsInSegment(pet, segment) {
  return (window.HOMELY_PRODUCTS || []).filter(
    (p) => p.pet === pet && p.segment === segment
  );
}

function parseFilterId(filterId) {
  if (!filterId || filterId === "all") return null;
  if (filterId === "dogs" || filterId === "cats") return { blockId: filterId };
  const parts = filterId.split("-");
  if (parts.length >= 2) {
    return { pet: parts[0], segment: parts.slice(1).join("-") };
  }
  return null;
}

function productCardHTML(p) {
  const badgeClass =
    p.badge &&
    (p.badge.includes("%") ||
      p.badge.includes("−") ||
      p.badge === "Subscribe" ||
      p.badge === "Free")
      ? "badge--sage"
      : "";
  const petWide = p.petImg === "pet-dog-cat-together.png" ? " product-card__pet--wide" : "";
  const priceHtml = p.was
    ? `<span class="price__was">${formatGBP(p.was)}</span><span class="price__amount">${formatGBP(p.price)}</span>`
    : `<span class="price__amount">${formatGBP(p.price)}</span>`;
  const safeName = p.name.replace(/"/g, "&quot;");

  const productUrl = `product.html?id=${encodeURIComponent(p.id)}`;

  return `
    <article class="product-card product-card--catalog" data-product="${safeName}" data-id="${p.id}" data-pet="${p.pet}" data-segment="${p.segment}">
      <a href="${productUrl}" class="product-card__link">
      <div class="product-card__media">
        <img src="images/${productImage(p)}" alt="${displayTitle(p)}" loading="lazy" />
        ${p.petImg ? `<img src="images/${p.petImg}" alt="" class="product-card__pet${petWide}" />` : ""}
        ${p.badge ? `<span class="badge ${badgeClass}">${p.badge}</span>` : ""}
      </div>
      <div class="product-card__body">
        <p class="product-card__cat">${p.type} · ${petLabel(p.pet)}</p>
        <h3>${displayTitle(p)}</h3>
        <p class="product-card__meta">${p.size}</p>
        <p class="product-card__desc">${p.desc}</p>
      </div>
      </a>
      <div class="product-card__footer">
        <p class="price">${priceHtml}</p>
        <a href="${productUrl}" class="btn btn--outline btn--sm">View</a>
        <button type="button" class="btn btn--primary btn--sm add-to-cart">Add</button>
      </div>
    </article>`;
}

function renderSubsection(pet, segment, title) {
  const items = productsInSegment(pet, segment);
  if (!items.length) return "";

  return `
    <div class="catalog-subsection" id="catalog-${pet}-${segment}">
      <h3 class="catalog-subhead">${title}</h3>
      <div class="catalog-grid">${items.map(productCardHTML).join("")}</div>
    </div>`;
}

function renderCatalogBlock(block) {
  const groupsHtml = block.groups
    .map((g) => renderSubsection(block.pet, g.segment, g.title))
    .join("");
  if (!groupsHtml.trim()) return "";

  return `
    <section class="catalog-block" id="${block.id}">
      <h2 class="catalog-block__title">${block.title}</h2>
      ${groupsHtml}
    </section>`;
}

function findGroupMeta(pet, segment) {
  for (const block of window.HOMELY_CATALOG_LAYOUT || []) {
    const group = block.groups.find((g) => g.segment === segment);
    if (group && block.pet === pet) return { block, group };
  }
  return null;
}

function countVisibleProducts(html) {
  return (html.match(/product-card--catalog/g) || []).length;
}

function buildCatalogHTML() {
  const layout = window.HOMELY_CATALOG_LAYOUT || [];
  const parsed = parseFilterId(activeCategory);

  if (activeCategory === "all") {
    return layout.map(renderCatalogBlock).join("");
  }

  if (parsed?.blockId) {
    const block = layout.find((b) => b.id === parsed.blockId);
    return block ? renderCatalogBlock(block) : "";
  }

  if (parsed?.pet && parsed?.segment) {
    const meta = findGroupMeta(parsed.pet, parsed.segment);
    const title =
      meta?.group.title ||
      window.HOMELY_CATEGORIES?.find((c) => c.id === activeCategory)?.label ||
      "Products";
    const blockTitle = meta?.block.title || (parsed.pet === "dog" ? "Dogs" : "Cats");
    return `
      <section class="catalog-block" id="${parsed.pet}-${parsed.segment}">
        <h2 class="catalog-block__title">${blockTitle}</h2>
        ${renderSubsection(parsed.pet, parsed.segment, title)}
      </section>`;
  }

  return "";
}

function renderCatalog() {
  const container = document.getElementById("catalog-sections");
  const countEl = document.getElementById("catalog-count");
  const filtersEl = document.getElementById("catalog-filters");

  if (!container || !window.HOMELY_PRODUCTS?.length) {
    if (container) {
      container.innerHTML =
        '<p class="catalog-error">Products could not load. Refresh the page or check that products.js is available.</p>';
    }
    return;
  }

  const html = buildCatalogHTML();
  const total = countVisibleProducts(html);

  container.innerHTML =
    html ||
    '<p class="catalog-empty">No products in this category yet.</p>';

  if (countEl) {
    countEl.textContent = `${total} product${total === 1 ? "" : "s"}`;
  }

  bindAddToCart();

  if (filtersEl && !filtersEl.dataset.ready) {
    filtersEl.dataset.ready = "1";
    filtersEl.innerHTML = window.HOMELY_CATEGORIES.map(
      (cat) =>
        `<button type="button" class="filter-btn${cat.id === activeCategory ? " is-active" : ""}" data-category="${cat.id}" role="tab" aria-selected="${cat.id === activeCategory}">${cat.label}</button>`
    ).join("");

    filtersEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      activeCategory = btn.dataset.category;
      filtersEl.querySelectorAll(".filter-btn").forEach((b) => {
        const on = b.dataset.category === activeCategory;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      renderCatalog();
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function bindAddToCart() {
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.replaceWith(btn.cloneNode(true));
  });
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const card = btn.closest(".product-card");
      const id = card?.dataset.id;
      const product = (id && findProductById(id)) || findProductByName(card?.dataset.product);
      if (!product) return;
      addToCart({
        id: product.id,
        name: product.name,
        label: `${product.name} (one-time)`,
        price: product.price,
        lineTotal: product.price,
        option: "once",
      });
      cartUI?.updateCartUI();
      cartUI?.openCart();
    });
  });
}

menuToggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

document.getElementById("subscribe-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = document.getElementById("subscribe-msg");
  if (msg) {
    msg.textContent = "You're on the list — connect Shopify Email when you launch.";
  }
  e.target.reset();
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const header = document.querySelector(".header");
window.addEventListener(
  "scroll",
  () => {
    header?.classList.toggle("header--scrolled", window.scrollY > 20);
  },
  { passive: true }
);

document.querySelectorAll("[data-filter]").forEach((link) => {
  link.addEventListener("click", (e) => {
    const cat = link.dataset.filter;
    if (!cat) return;
    activeCategory = cat;
    const filtersEl = document.getElementById("catalog-filters");
    filtersEl?.querySelectorAll(".filter-btn").forEach((b) => {
      const on = b.dataset.category === activeCategory;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", String(on));
    });
    renderCatalog();
  });
});

cartUI = initCartUI();

try {
  renderCatalog();
  cartUI?.updateCartUI();
} catch (err) {
  console.error(err);
  const container = document.getElementById("catalog-sections");
  if (container) {
    container.innerHTML =
      '<p class="catalog-error">Something went wrong loading products. Please refresh the page.</p>';
  }
}
