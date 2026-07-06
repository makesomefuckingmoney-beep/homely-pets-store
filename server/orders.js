const fs = require("fs");
const path = require("path");
const { buildDeliveryTimeline, getDeliveryState } = require("./delivery");
const { notifyNewOrder } = require("./notify");

const DATA_DIR = path.join(__dirname, "..", "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
}

function loadOrders() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  ensureStore();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function randomDigits(n) {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(Math.random() * 10);
  return out;
}

function generateOrderNumber(orders) {
  for (let i = 0; i < 20; i++) {
    const num = `HP-${randomDigits(6)}`;
    if (!orders.some((o) => o.orderNumber === num)) return num;
  }
  return `HP-${Date.now().toString().slice(-6)}`;
}

function trackingFromOrder(orderNumber) {
  const digits = orderNumber.replace(/\D/g, "").padStart(9, "0").slice(-9);
  return `HPLY${digits}GB`;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function parseLineItems(session) {
  const items = session.line_items?.data || [];
  return items.map((line) => {
    const meta = line.price?.product_data?.metadata || {};
    return {
      id: meta.product_id || null,
      option: meta.option || "once",
      name: line.description || line.price?.product_data?.name || "Homely Pets item",
      quantity: line.quantity || 1,
      amount: (line.amount_total || 0) / 100,
    };
  });
}

async function createFromStripeSession(stripe, sessionId, catalogById) {
  const orders = loadOrders();
  const existing = orders.find((o) => o.stripeSessionId === sessionId);
  if (existing) return existing;

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product"],
  });

  if (session.payment_status !== "paid") {
    const err = new Error("Payment not completed for this session.");
    err.status = 402;
    throw err;
  }

  const email = session.customer_details?.email || session.customer_email;
  if (!email) {
    const err = new Error("No customer email on this order.");
    err.status = 400;
    throw err;
  }

  const createdAt = new Date().toISOString();
  const orderNumber = generateOrderNumber(orders);
  const shipping = session.shipping_details?.address || session.customer_details?.address || {};
  const customerName = session.shipping_details?.name || session.customer_details?.name || "Customer";

  const order = {
    orderNumber,
    trackingNumber: trackingFromOrder(orderNumber),
    stripeSessionId: sessionId,
    email: normalizeEmail(email),
    customerName,
    shipping: {
      line1: shipping.line1 || "",
      line2: shipping.line2 || "",
      city: shipping.city || "",
      postalCode: shipping.postal_code || "",
      country: shipping.country || "GB",
    },
    items: parseLineItems(session),
    total: (session.amount_total || 0) / 100,
    currency: (session.currency || "gbp").toUpperCase(),
    carrier: "Royal Mail Tracked 48",
    createdAt,
    estimatedDelivery: buildDeliveryTimeline(createdAt).estimatedDelivery,
    timeline: buildDeliveryTimeline(createdAt).events,
  };

  orders.push(order);
  saveOrders(orders);

  notifyNewOrder(order).catch((err) => {
    console.error("[notify] Purchase alert error:", err.message);
  });

  return order;
}

function findOrder(orderNumber, email) {
  const orders = loadOrders();
  const order = orders.find(
    (o) => o.orderNumber.toUpperCase() === String(orderNumber || "").trim().toUpperCase()
  );
  if (!order) return null;
  if (normalizeEmail(email) !== order.email) return null;
  return order;
}

function publicOrderView(order) {
  const state = getDeliveryState(order.timeline);
  return {
    orderNumber: order.orderNumber,
    trackingNumber: order.trackingNumber,
    customerName: order.customerName,
    email: order.email.replace(/(.{2}).*(@.*)/, "$1•••$2"),
    shipping: order.shipping,
    items: order.items,
    total: order.total,
    currency: order.currency,
    carrier: order.carrier,
    createdAt: order.createdAt,
    estimatedDelivery: order.estimatedDelivery,
    currentStatus: state.currentStatus,
    currentLabel: state.currentLabel,
    timeline: state.timeline,
    trackUrl: `track.html?order=${encodeURIComponent(order.orderNumber)}`,
  };
}

module.exports = {
  createFromStripeSession,
  findOrder,
  publicOrderView,
};
