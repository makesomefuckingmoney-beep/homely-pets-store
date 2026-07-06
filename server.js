require("dotenv").config();
const express = require("express");
const path = require("path");
const Stripe = require("stripe");
const { lineForProduct } = require("./server/pricing");
const {
  createFromStripeSession,
  findOrder,
  publicOrderView,
} = require("./server/orders");
const { configuredChannels, sendTestNotification } = require("./server/notify");

const domainConfig = require("./server/domain");
const { resolveSiteUrl } = require("./server/site-url");
const PORT = process.env.PORT || 4242;
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");

if (!process.env.STRIPE_SECRET_KEY) {
  console.error(
    "\nMissing STRIPE_SECRET_KEY. Copy .env.example to .env and add your Stripe secret key.\n"
  );
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const catalog = require("./server/products.json");
const catalogById = Object.fromEntries(catalog.map((p) => [p.id, p]));

const app = express();

app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).send("Webhook not configured");
    }
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      try {
        await createFromStripeSession(stripe, session.id);
      } catch (err) {
        console.error("Webhook order create:", err.message);
      }
    }
    res.json({ received: true });
  }
);

app.use(express.json({ limit: "256kb" }));
app.use(express.static(path.join(__dirname)));

app.get("/api/health", (req, res) => {
  const notifications = configuredChannels();
  res.json({
    ok: true,
    payments: "stripe",
    tracking: true,
    notifications: notifications.length ? notifications : "not configured",
    domain: domainConfig.domain,
    primaryUrl: domainConfig.primaryUrl,
    siteUrl: resolveSiteUrl(req),
  });
});

app.get("/api/domain", (_req, res) => {
  res.json({
    domain: domainConfig.domain,
    wwwHost: domainConfig.wwwHost,
    primaryUrl: domainConfig.primaryUrl,
    registrar: domainConfig.registrar,
    renderHost: domainConfig.renderServiceHost,
  });
});

app.post("/api/notify/test", async (req, res) => {
  const secret = process.env.NOTIFY_ADMIN_SECRET;
  if (!secret || req.headers["x-notify-secret"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const channels = configuredChannels();
  if (!channels.length) {
    return res.status(400).json({
      error: "No notification channels configured. Add Pushover or Telegram to .env — see NOTIFY.md",
    });
  }
  const result = await sendTestNotification();
  res.json({ ok: true, ...result });
});

app.get("/api/order/confirm", async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).json({ error: "Missing session_id." });
    }
    const order = await createFromStripeSession(stripe, sessionId);
    res.json(publicOrderView(order));
  } catch (err) {
    console.error("Order confirm:", err.message);
    res.status(err.status || 500).json({ error: err.message || "Could not confirm order." });
  }
});

app.get("/api/track", (req, res) => {
  const orderNumber = req.query.order;
  const email = req.query.email;
  if (!orderNumber || !email) {
    return res.status(400).json({ error: "Enter your order number and email." });
  }
  const order = findOrder(orderNumber, email);
  if (!order) {
    return res.status(404).json({
      error: "No order found. Check your order number and email match checkout.",
    });
  }
  res.json(publicOrderView(order));
});

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Your bag is empty." });
    }
    if (items.length > 50) {
      return res.status(400).json({ error: "Too many items in one checkout." });
    }

    const line_items = [];
    for (const item of items) {
      const id = item?.id;
      const option = item?.option || "once";
      const product = catalogById[id];
      if (!product) {
        return res.status(400).json({ error: `Unknown product: ${id}` });
      }
      if (!["once", "bundle3", "subscribe"].includes(option)) {
        return res.status(400).json({ error: `Invalid purchase option: ${option}` });
      }
      const line = lineForProduct(product, option);
      line_items.push({
        quantity: line.quantity,
        price_data: {
          currency: "gbp",
          unit_amount: line.unitAmount,
          product_data: {
            name: line.name,
            metadata: { product_id: id, option },
          },
        },
      });
    }

    const siteUrl = resolveSiteUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${siteUrl}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout-cancel.html`,
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["GB"] },
      phone_number_collection: { enabled: true },
      payment_method_types: ["card"],
      allow_promotion_codes: true,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    res.status(500).json({ error: err.message || "Could not start checkout." });
  }
});

app.listen(PORT, () => {
  console.log(`Homely Pets store → ${SITE_URL}`);
  console.log(`Production domain → ${domainConfig.primaryUrl} (GoDaddy)`);
  console.log(`Stripe Checkout ready (${process.env.STRIPE_SECRET_KEY.startsWith("sk_live") ? "LIVE" : "test"} mode)`);
  console.log(`Delivery tracking → ${SITE_URL}/track.html`);
});
