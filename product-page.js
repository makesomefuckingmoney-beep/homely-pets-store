(function () {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const main = document.getElementById("product-main");

  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.querySelector(".nav");
  const cartUI = initCartUI();

  let selectedOptionId = "once";
  let pageData = null;

  function paymentIcon(icon) {
    if (icon === "apple") {
      return `<span class="pay-icon pay-icon--apple" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
      </span>`;
    }
    if (icon === "klarna") {
      return `<span class="pay-icon pay-icon--klarna" aria-hidden="true">Klarna.</span>`;
    }
    return `<span class="pay-icon pay-icon--amex" aria-hidden="true">AMEX</span>`;
  }

  function relatedProducts(product) {
    return (window.HOMELY_PRODUCTS || [])
      .filter((p) => p.id !== product.id && p.pet === product.pet && p.segment === product.segment)
      .slice(0, 4);
  }

  function renderProduct(product) {
    pageData = buildProductPageData(product);
    selectedOptionId = "once";
    const option = pageData.purchaseOptions[0];
    document.title = `${displayTitle(product)} — Homely Pets`;

    const related = relatedProducts(product);
    const relatedHtml = related.length
      ? `<section class="product-related">
          <h2>You may also like</h2>
          <div class="product-related__grid">
            ${related
              .map(
                (p) => `
              <a href="product.html?id=${encodeURIComponent(p.id)}" class="product-related__card">
                <img src="images/${productImage(p)}" alt="" loading="lazy" />
                <span>${displayTitle(p)}</span>
                <strong>${formatGBP(p.price)}</strong>
              </a>`
              )
              .join("")}
          </div>
        </section>`
      : "";

    main.innerHTML = `
      <div class="container product-page__inner">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Home</a>
          <span aria-hidden="true">/</span>
          <a href="index.html#shop">Shop</a>
          <span aria-hidden="true">/</span>
          <span>${displayTitle(product)}</span>
        </nav>

        <div class="product-layout">
          <div class="product-gallery">
            <div class="product-gallery__frame">
              <img src="images/${productImage(product)}" alt="${displayTitle(product)} packaging" id="product-hero-img" />
              ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
            </div>
          </div>

          <div class="product-buy">
            <p class="product-buy__cat">${product.type} · ${product.pet === "dog" ? "Dog" : "Cat"}</p>
            <h1>${displayTitle(product)}</h1>
            <p class="product-buy__flavour">${pageData.flavour}</p>
            <p class="product-buy__size">${product.size}</p>

            <p class="product-buy__price" id="product-price">${formatGBP(option.lineTotal)}</p>
            <p class="product-buy__price-note" id="product-price-note">${option.qtyLabel}</p>

            <fieldset class="purchase-options" id="purchase-options">
              <legend class="purchase-options__legend">How would you like to buy?</legend>
              ${pageData.purchaseOptions
                .map(
                  (opt, i) => `
                <label class="purchase-option${i === 0 ? " is-selected" : ""}">
                  <input type="radio" name="purchase" value="${opt.id}" ${i === 0 ? "checked" : ""} />
                  <span class="purchase-option__body">
                    <span class="purchase-option__top">
                      <strong>${opt.label}</strong>
                      ${opt.badge ? `<span class="purchase-option__badge">${opt.badge}</span>` : ""}
                    </span>
                    <span class="purchase-option__detail">${opt.detail}</span>
                    <span class="purchase-option__price">${formatGBP(opt.lineTotal)} · ${opt.qtyLabel}</span>
                  </span>
                </label>`
                )
                .join("")}
            </fieldset>

            <button type="button" class="btn btn--primary btn--block" id="add-product-btn">Add to bag</button>

            <div class="payment-methods">
              <p class="payment-methods__label">Pay with</p>
              <div class="payment-methods__row" role="list">
                ${pageData.paymentMethods
                  .map(
                    (m) => `
                  <button type="button" class="payment-method" data-pay="${m.id}" role="listitem" aria-label="${m.label}">
                    ${paymentIcon(m.icon)}
                    <span>${m.label}</span>
                  </button>`
                  )
                  .join("")}
              </div>
              <p class="payment-methods__note" id="pay-note">Apple Pay, Klarna, and cards at Stripe checkout.</p>
            </div>

            <ul class="product-features">
              ${pageData.features.map((f) => `<li>${f}</li>`).join("")}
            </ul>
          </div>
        </div>

        <section class="product-description">
          <h2>About this product</h2>
          <p>${pageData.longDescription}</p>
          <p class="product-description__note">${HOMELY_PRODUCT_PAGE.threeForOneNote}</p>
        </section>

        ${relatedHtml}
      </div>`;

    bindProductEvents(product);
  }

  function selectedOption() {
    return pageData?.purchaseOptions.find((o) => o.id === selectedOptionId) || pageData?.purchaseOptions[0];
  }

  function bindProductEvents(product) {
    document.querySelectorAll('input[name="purchase"]').forEach((input) => {
      input.addEventListener("change", () => {
        selectedOptionId = input.value;
        document.querySelectorAll(".purchase-option").forEach((el) => {
          el.classList.toggle("is-selected", el.querySelector("input")?.value === selectedOptionId);
        });
        const opt = selectedOption();
        document.getElementById("product-price").textContent = formatGBP(opt.lineTotal);
        document.getElementById("product-price-note").textContent = opt.qtyLabel;
      });
    });

    document.getElementById("add-product-btn")?.addEventListener("click", () => {
      const opt = selectedOption();
      addToCart({
        id: product.id,
        name: product.name,
        label: opt.cartLabel,
        price: product.price,
        lineTotal: opt.lineTotal,
        option: opt.id,
      });
      cartUI?.updateCartUI();
      cartUI?.openCart();
    });

    document.querySelectorAll(".payment-method").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".payment-method").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const note = document.getElementById("pay-note");
        if (note) note.textContent = `${btn.getAttribute("aria-label")} is available at Stripe checkout.`;
      });
    });
  }

  menuToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    menuToggle?.setAttribute("aria-expanded", String(open));
  });

  if (!productId) {
    main.innerHTML = `<div class="container"><p class="product-page__error">No product selected. <a href="index.html#shop">Browse the shop</a>.</p></div>`;
    return;
  }

  const product = findProductById(productId);
  if (!product) {
    main.innerHTML = `<div class="container"><p class="product-page__error">Product not found. <a href="index.html#shop">Back to shop</a>.</p></div>`;
    return;
  }

  renderProduct(product);
})();
