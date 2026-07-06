function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(amount, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
}

function statusIcon(done, active) {
  if (done) return '<span class="track-timeline__dot track-timeline__dot--done" aria-hidden="true"></span>';
  if (active) return '<span class="track-timeline__dot track-timeline__dot--active" aria-hidden="true"></span>';
  return '<span class="track-timeline__dot" aria-hidden="true"></span>';
}

function renderTracking(order) {
  const timeline = order.timeline
    .map(
      (step) => `
      <li class="track-timeline__item${step.done ? " is-done" : ""}${step.active ? " is-active" : ""}">
        ${statusIcon(step.done, step.active)}
        <div>
          <strong>${step.label}</strong>
          <time datetime="${step.at}">${formatDate(step.at)}</time>
        </div>
      </li>`
    )
    .join("");

  const items = order.items
    .map((item) => `<li>${item.name}${item.quantity > 1 ? ` × ${item.quantity}` : ""}</li>`)
    .join("");

  return `
    <div class="track-card">
      <div class="track-card__head">
        <div>
          <p class="track-card__eyebrow">Order ${order.orderNumber}</p>
          <h2>${order.currentLabel}</h2>
        </div>
        <span class="track-card__badge track-card__badge--${order.currentStatus}">${order.currentStatus.replace(/_/g, " ")}</span>
      </div>

      <dl class="track-meta">
        <div><dt>Tracking number</dt><dd><code>${order.trackingNumber}</code></dd></div>
        <div><dt>Carrier</dt><dd>${order.carrier}</dd></div>
        <div><dt>Estimated delivery</dt><dd>${formatDate(order.estimatedDelivery)}</dd></div>
        <div><dt>Ship to</dt><dd>${order.customerName}<br>${order.shipping.line1}${order.shipping.line2 ? `<br>${order.shipping.line2}` : ""}<br>${order.shipping.city} ${order.shipping.postalCode}</dd></div>
      </dl>

      <ol class="track-timeline" aria-label="Delivery progress">${timeline}</ol>

      <div class="track-items">
        <h3>Items in this order</h3>
        <ul>${items}</ul>
        <p class="track-items__total">Total <strong>${formatMoney(order.total, order.currency)}</strong></p>
      </div>
    </div>`;
}

async function lookupOrder(order, email) {
  const params = new URLSearchParams({ order, email });
  const res = await fetch(`/api/track?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not find that order.");
  return data;
}

function showError(msg) {
  const el = document.getElementById("track-error");
  if (!el) return;
  el.textContent = msg;
  el.hidden = !msg;
}

function showResult(html) {
  const result = document.getElementById("track-result");
  if (!result) return;
  result.innerHTML = html;
  result.classList.remove("is-hidden");
}

async function handleSubmit(e) {
  e.preventDefault();
  showError("");
  const order = document.getElementById("track-order")?.value.trim();
  const email = document.getElementById("track-email")?.value.trim();
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Looking up…";
  }
  try {
    const data = await lookupOrder(order, email);
    showResult(renderTracking(data));
    history.replaceState(null, "", `?order=${encodeURIComponent(order)}`);
  } catch (err) {
    document.getElementById("track-result")?.classList.add("is-hidden");
    showError(err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Track delivery";
    }
  }
}

document.getElementById("track-form")?.addEventListener("submit", handleSubmit);

(async function initFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const order = params.get("order");
  if (!order) return;
  const orderInput = document.getElementById("track-order");
  if (orderInput) orderInput.value = order;
})();
