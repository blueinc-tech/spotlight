/**
 * Daily retry of form notification emails, for hosts without Vercel Cron (e.g. Hostinger).
 * Run it with the app's environment loaded, for example a Hostinger "Node.js" cron job:
 *
 *   node --env-file=<app .env> scripts/cron-notifications.mjs
 *
 * It calls /api/cron/notifications/ with CRON_SECRET and prints only the result counts.
 */
const secret = process.env.CRON_SECRET;
const base = (process.env.SITE_URL || "https://spotlightnigeria-france.com").replace(/\/$/, "");

if (!secret) {
  console.error("CRON_SECRET is not set in this environment; nothing was called.");
  process.exit(1);
}

try {
  const res = await fetch(`${base}/api/cron/notifications/`, {
    headers: { Authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(60_000),
  });
  const body = await res.text();
  console.log(`${new Date().toISOString()} ${res.status} ${body.slice(0, 300)}`);
  if (!res.ok) process.exit(1);
} catch (err) {
  console.error(`${new Date().toISOString()} request failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}
