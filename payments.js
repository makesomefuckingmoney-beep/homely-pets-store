/** Stripe Checkout + store server status */
const STORE_PORT = "4242";
const STORE_URL = `http://localhost:${STORE_PORT}`;

function isStoreServer() {
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:") return false;
  if (hostname !== "localhost" && hostname !== "127.0.0.1") return true;
  return port === STORE_PORT || port === "";
}

function showStoreBanner(message) {
  let el = document.getElementById("store-status-banner");
  if (!el) {
    el = document.createElement("div");
    el.id = "store-status-banner";
    el.className = "store-status-banner";
    el.setAttribute("role", "status");
    document.body.prepend(el);
  }
  el.innerHTML = message;
  el.hidden = false;
}

async function checkStoreHealth() {
  if (isStoreServer()) return true;

  showStoreBanner(
    `Checkout needs the payment server. Run <code>./start.sh</code> in Terminal, then open <a href="${STORE_URL}"><strong>${STORE_URL}</strong></a> (not port 8765).`
  );
  return false;
}

async function startStripeCheckout() {
  const btn = document.getElementById("checkout-btn");
  const errEl = document.getElementById("checkout-error");

  if (!isStoreServer()) {
    if (errEl) {
      errEl.innerHTML = `Open <a href="${STORE_URL}">${STORE_URL}</a> to checkout.`;
    }
    showStoreBanner(
      `Wrong address for payments. Use <a href="${STORE_URL}"><strong>${STORE_URL}</strong></a> after running <code>./start.sh</code>.`
    );
    return;
  }

  const items = normalizeCartItems()
    .filter((item) => item.id)
    .map((item) => ({ id: item.id, option: item.option || "once" }));

  if (!items.length) {
    if (errEl) errEl.textContent = "Add at least one product to your bag.";
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Redirecting to secure checkout…";
  }
  if (errEl) errEl.textContent = "";

  try {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Checkout failed");
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    throw new Error("No checkout URL returned");
  } catch (err) {
    const msg =
      err.message === "Failed to fetch"
        ? "Payment server is not running. Run ./start.sh in Terminal."
        : err.message || "Could not start checkout.";
    if (errEl) errEl.textContent = msg;
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Checkout securely";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkStoreHealth();
});
