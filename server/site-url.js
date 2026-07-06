/** Resolve public site URL (Render, custom domain, or local .env) */
function normalizeUrl(url) {
  const u = String(url || "").trim().replace(/\/$/, "");
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://${u}`;
}

function resolveSiteUrl(req) {
  const fromEnv = normalizeUrl(process.env.SITE_URL);
  const isLocal =
    !fromEnv ||
    fromEnv.includes("localhost") ||
    fromEnv.includes("127.0.0.1");

  if (fromEnv && !isLocal) return fromEnv;

  if (req) {
    const host = (req.headers["x-forwarded-host"] || req.get("host") || "")
      .split(",")[0]
      .trim();
    const proto = (req.headers["x-forwarded-proto"] || req.protocol || "https")
      .split(",")[0]
      .trim();
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      return `${proto}://${host}`;
    }
  }

  const port = process.env.PORT || 4242;
  return fromEnv || `http://localhost:${port}`;
}

module.exports = { resolveSiteUrl };
