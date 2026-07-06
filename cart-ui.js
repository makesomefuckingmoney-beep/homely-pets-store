/** Shared cart drawer UI (index + product pages) */
function initCartUI() {
  const cartBtn = document.getElementById("cart-btn");
  const cartCount = document.getElementById("cart-count");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartClose = document.getElementById("cart-close");
  const cartItems = document.getElementById("cart-items");
  const cartEmpty = document.getElementById("cart-empty");
  const cartTotalEl = document.getElementById("cart-total");
  const overlay = document.getElementById("overlay");

  function updateCartUI() {
    const items = normalizeCartItems();
    const count = items.length;
    if (cartCount) cartCount.textContent = String(count);
    cartBtn?.setAttribute("aria-label", `Cart, ${count} items`);

    if (!cartItems) return;
    cartItems.innerHTML = "";
    if (count === 0) {
      cartEmpty?.classList.remove("is-hidden");
      if (cartTotalEl) cartTotalEl.textContent = formatGBP(0);
      const checkoutBtn = document.getElementById("checkout-btn");
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    cartEmpty?.classList.add("is-hidden");
    items.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${item.label || item.name}</span><strong>${formatGBP(item.lineTotal ?? item.price)}</strong>`;
      cartItems.appendChild(li);
    });
    if (cartTotalEl) cartTotalEl.textContent = formatGBP(getCartTotal(items));

    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) checkoutBtn.disabled = count === 0;
  }

  function bindCheckout() {
    const checkoutBtn = document.getElementById("checkout-btn");
    checkoutBtn?.addEventListener("click", () => {
      if (typeof startStripeCheckout === "function") startStripeCheckout();
    });
  }

  function openCart() {
    cartDrawer?.classList.add("is-open");
    cartDrawer?.setAttribute("aria-hidden", "false");
    if (overlay) overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    cartDrawer?.classList.remove("is-open");
    cartDrawer?.setAttribute("aria-hidden", "true");
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = "";
  }

  cartBtn?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);
  overlay?.addEventListener("click", closeCart);

  bindCheckout();
  updateCartUI();
  return { updateCartUI, openCart, closeCart };
}
