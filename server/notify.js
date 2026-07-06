/**
 * Purchase alerts — Pushover (phone app), Telegram, Discord/Slack webhook.
 * Configure any combination in .env. See NOTIFY.md.
 */

const SITE_URL = (process.env.SITE_URL || "http://localhost:4242").replace(/\/$/, "");

function formatMoney(amount, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
}

function buildOrderMessage(order) {
  const items = order.items
    .map((i) => `• ${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`)
    .join("\n");
  const ship = order.shipping;
  const address = [ship.line1, ship.line2, ship.city, ship.postalCode]
    .filter(Boolean)
    .join(", ");

  return {
    title: `New order ${order.orderNumber}`,
    short: `Homely Pets — ${order.orderNumber} — ${formatMoney(order.total, order.currency)}`,
    body: [
      `🛒 New Homely Pets purchase`,
      ``,
      `Order: ${order.orderNumber}`,
      `Total: ${formatMoney(order.total, order.currency)}`,
      `Customer: ${order.customerName}`,
      `Email: ${order.email}`,
      ``,
      `Items:`,
      items,
      ``,
      `Ship to: ${address}`,
      `Tracking: ${order.trackingNumber}`,
      ``,
      `Track: ${SITE_URL}/track.html?order=${encodeURIComponent(order.orderNumber)}`,
    ].join("\n"),
  };
}

function configuredChannels() {
  const channels = [];
  if (process.env.PUSHOVER_USER_KEY && process.env.PUSHOVER_APP_TOKEN) {
    channels.push("pushover");
  }
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    channels.push("telegram");
  }
  if (process.env.DISCORD_WEBHOOK_URL) channels.push("discord");
  if (process.env.SLACK_WEBHOOK_URL) channels.push("slack");
  if (process.env.NOTIFY_WEBHOOK_URL) channels.push("webhook");
  return channels;
}

async function sendPushover(msg) {
  const user = process.env.PUSHOVER_USER_KEY;
  const token = process.env.PUSHOVER_APP_TOKEN;
  const body = new URLSearchParams({
    token,
    user,
    title: msg.title,
    message: msg.body,
    priority: "1",
    sound: "cashregister",
  });
  const res = await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pushover: ${err}`);
  }
}

async function sendTelegram(msg) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const text = `<b>${escapeHtml(msg.title)}</b>\n\n${escapeHtml(msg.body)}`;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram: ${data.description || "send failed"}`);
}

async function sendDiscord(msg) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Homely Pets",
      content: `**${msg.title}**\n\`\`\`\n${msg.body}\n\`\`\``,
    }),
  });
  if (!res.ok) throw new Error(`Discord: HTTP ${res.status}`);
}

async function sendSlack(msg) {
  const url = process.env.SLACK_WEBHOOK_URL;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: `*${msg.title}*\n${msg.body}` }),
  });
  if (!res.ok) throw new Error(`Slack: HTTP ${res.status}`);
}

async function sendGenericWebhook(msg, order) {
  const url = process.env.NOTIFY_WEBHOOK_URL;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "order.created",
      title: msg.title,
      message: msg.body,
      order: {
        orderNumber: order.orderNumber,
        total: order.total,
        currency: order.currency,
        email: order.email,
        trackingNumber: order.trackingNumber,
      },
    }),
  });
  if (!res.ok) throw new Error(`Webhook: HTTP ${res.status}`);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function notifyNewOrder(order) {
  const channels = configuredChannels();
  if (!channels.length) {
    console.log(
      `[notify] New order ${order.orderNumber} — no alerts configured (see NOTIFY.md)`
    );
    return { sent: [], skipped: true };
  }

  const msg = buildOrderMessage(order);
  const sent = [];
  const failed = [];

  const tasks = [
    { name: "pushover", fn: () => sendPushover(msg) },
    { name: "telegram", fn: () => sendTelegram(msg) },
    { name: "discord", fn: () => sendDiscord(msg) },
    { name: "slack", fn: () => sendSlack(msg) },
    { name: "webhook", fn: () => sendGenericWebhook(msg, order) },
  ];

  for (const task of tasks) {
    if (!channels.includes(task.name)) continue;
    try {
      await task.fn();
      sent.push(task.name);
      console.log(`[notify] Sent ${task.name} alert for ${order.orderNumber}`);
    } catch (err) {
      failed.push({ channel: task.name, error: err.message });
      console.error(`[notify] ${task.name} failed:`, err.message);
    }
  }

  return { sent, failed, skipped: false };
}

async function sendTestNotification() {
  const sample = {
    orderNumber: "HP-TEST01",
    trackingNumber: "HPLY000000001GB",
    email: "customer@example.com",
    customerName: "Test Customer",
    shipping: {
      line1: "12 Homely Lane",
      line2: "",
      city: "London",
      postalCode: "SW1A 1AA",
      country: "GB",
    },
    items: [{ name: "Adult Dry — Chicken & Sweet Potato (2kg)", quantity: 1, amount: 24.9 }],
    total: 24.9,
    currency: "GBP",
  };
  return notifyNewOrder(sample);
}

module.exports = {
  notifyNewOrder,
  sendTestNotification,
  configuredChannels,
  buildOrderMessage,
};
