# 3 things only YOU can do (I prepared everything else)

Your code is committed locally in `~/homely-pets-demo`.  
I **cannot** log into GoDaddy, GitHub, or Render for you — those need your password.

---

## 1. GoDaddy (2 minutes) — copy exactly

On **homelypets.co.uk → DNS Records**:

**Add:**
- Type: `CNAME` | Name: `www` | Data: `homely-pets-store.onrender.com`

**Delete:**
- The `A` record `@` → `WebsiteBuilder Site`

**Forwarding tab:**
- Forward `homelypets.co.uk` → `https://www.homelypets.co.uk` (Permanent 301)

---

## 2. GitHub (5 minutes)

1. Open https://github.com/new  
2. Repository name: `homely-pets-store`  
3. **Do not** add README — click **Create repository**  
4. In Terminal on your Mac:

```bash
cd ~/homely-pets-demo
chmod +x scripts/push-github.sh
./scripts/push-github.sh YOUR_GITHUB_USERNAME
```

(Replace `YOUR_GITHUB_USERNAME` with your GitHub login.)

---

## 3. Render (10 minutes)

1. Open https://render.com → sign up with **GitHub**  
2. **New +** → **Blueprint**  
3. Select repo **homely-pets-store** → **Apply**  
4. When asked:

| Key | Value |
|-----|--------|
| `STRIPE_SECRET_KEY` | your `sk_test_...` or `sk_live_...` |
| `SITE_URL` | `https://www.homelypets.co.uk` |

5. Wait for deploy → **Settings** → **Custom Domains** → add `www.homelypets.co.uk`  
6. Wait 15–60 min → open **https://www.homelypets.co.uk**

---

## Already done for you

- [x] Store code with Stripe + tracking + notifications  
- [x] Domain config for `homelypets.co.uk`  
- [x] `render.yaml` for one-click Render deploy  
- [x] Git repo initialized and committed (secrets in `.env` are NOT included)  
- [x] Push script: `scripts/push-github.sh`

---

## Need help?

Reply with a screenshot or say which step (GoDaddy / GitHub / Render) you're stuck on.
