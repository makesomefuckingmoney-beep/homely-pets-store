/** Checkout success — confirm order and show tracking */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

async function loadOrder() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const root = document.getElementById("success-root");
  const loading = document.getElementById("success-loading");
  const details = document.getElementById("success-details");
  const errEl = document.getElementById("success-error");

  if (!sessionId) {
    loading?.classList.add("is-hidden");
    if (errEl) {
      errEl.textContent = "Missing checkout session. Your payment may still have gone through — use Track order with your email.";
      errEl.hidden = false;
    }
    return;
  }

  try {
    const res = await fetch(`/api/order/confirm?session_id=${encodeURIComponent(sessionId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load order");

    loading?.classList.add("is-hidden");
    details?.classList.remove("is-hidden");

    document.getElementById("success-order-num").textContent = data.orderNumber;
    document.getElementById("success-tracking-num").textContent = data.trackingNumber;
    document.getElementById("success-status").textContent = data.currentLabel;
    document.getElementById("success-eta").textContent = formatDate(data.estimatedDelivery);

    const trackLink = document.getElementById("success-track-link");
    if (trackLink) {
      trackLink.href = `track.html?order=${encodeURIComponent(data.orderNumber)}`;
    }
  } catch (err) {
    loading?.classList.add("is-hidden");
    if (errEl) {
      errEl.textContent = err.message;
      errEl.hidden = false;
    }
  }
}

localStorage.removeItem("homely-cart-v1");
document.addEventListener("DOMContentLoaded", loadOrder);
