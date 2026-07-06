# Purchase notifications

Get a **phone alert** every time someone buys on Homely Pets.

## Option 1 — Pushover (recommended phone app)

[Pushover](https://pushover.net) is a simple notification app for iPhone and Android (~£5 one-time per platform).

1. Install **Pushover** on your phone and create an account.
2. Open [pushover.net/apps/build](https://pushover.net/apps/build) → create an application (e.g. “Homely Pets Store”).
3. Copy the **API Token/Key** → this is `PUSHOVER_APP_TOKEN`.
4. On your [Pushover dashboard](https://pushover.net/), copy your **User Key** → `PUSHOVER_USER_KEY`.
5. Add to `.env`:

```env
PUSHOVER_USER_KEY=your_user_key
PUSHOVER_APP_TOKEN=your_app_token
```

6. Restart the store: `./start.sh`
7. Test (optional):

```bash
curl -X POST http://localhost:4242/api/notify/test \
  -H "x-notify-secret: your_secret_here" \
  -H "Content-Type: application/json"
```

Set `NOTIFY_ADMIN_SECRET` in `.env` for the test endpoint.

---

## Option 2 — Telegram (free)

1. In Telegram, message [@BotFather](https://t.me/BotFather) → `/newbot` → copy the **bot token**.
2. Message your new bot once, then open:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
   and find your **chat id** (a number).
3. Add to `.env`:

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=123456789
```

4. Restart `./start.sh`

---

## Option 3 — Discord or Slack

**Discord:** Server settings → Integrations → Webhooks → New webhook → copy URL:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

**Slack:** Apps → Incoming Webhooks → copy URL:

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

---

## What you receive

Each new paid order sends:

- Order number (e.g. `HP-284719`)
- Total amount
- Customer name & email
- Items ordered
- Shipping address
- Tracking number
- Link to track the order

Alerts fire when payment completes (success page or Stripe webhook).

You can enable **multiple channels** at once (e.g. Pushover + Telegram).

---

## Production

When deployed on Render/Railway, add the same env vars in your hosting dashboard and restart the service.

For reliable alerts even if the customer closes the browser early, set up a Stripe webhook:

1. Stripe Dashboard → Developers → Webhooks → Add endpoint  
2. URL: `https://your-domain.com/api/stripe-webhook`  
3. Event: `checkout.session.completed`  
4. Add `STRIPE_WEBHOOK_SECRET=whsec_...` to `.env`
