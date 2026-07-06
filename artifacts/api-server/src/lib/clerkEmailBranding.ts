import { logger } from "./logger";

const APP_NAME = "FMAA Portal";

// User-facing Clerk email templates that reference the tenant's application
// name via the {{app.name}} variable. The Replit-managed Clerk tenant carries
// an outdated application name, so we rewrite these templates to use the real
// app name instead.
const TEMPLATE_SLUGS = [
  "verification_code",
  "reset_password_code",
  "magic_link_sign_in",
  "magic_link_sign_up",
  "magic_link_user_profile",
  "new_device_sign_in",
  "password_changed",
  "password_removed",
  "primary_email_address_changed",
  "invitation",
  "account_locked",
];

const APP_NAME_VAR = /\{\{\s*app\.name\s*\}\}/g;
// The {{> app_logo}} partial renders the tenant's application name as text
// when no logo is uploaded, so it leaks the stale name too. Replace it with
// the app name directly.
const APP_LOGO_PARTIAL = /\{\{>\s*app_logo\s*\}\}/g;
const NEEDS_FIX = /\{\{\s*app\.name\s*\}\}|\{\{>\s*app_logo\s*\}\}/;

function rebrand(text: string | null): string | null {
  if (!text) return text;
  return text.replace(APP_NAME_VAR, APP_NAME).replace(APP_LOGO_PARTIAL, APP_NAME);
}

interface ClerkEmailTemplate {
  slug: string;
  name: string;
  subject: string | null;
  markup: string | null;
  body: string | null;
  delivered_by_clerk: boolean;
}

// Idempotent: after the first run the templates no longer contain
// {{app.name}}, so subsequent startups are no-ops. Runs against whichever
// Clerk instance the current secret key belongs to (dev in development,
// live in production), which is exactly what we want since the two
// instances have separate template stores.
export async function fixClerkEmailBranding(): Promise<void> {
  const secretKey = process.env["CLERK_SECRET_KEY"];
  if (!secretKey) {
    logger.warn("CLERK_SECRET_KEY not set; skipping email branding fix");
    return;
  }
  const headers = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };

  for (const slug of TEMPLATE_SLUGS) {
    try {
      const res = await fetch(
        `https://api.clerk.com/v1/templates/email/${slug}`,
        { headers },
      );
      if (!res.ok) {
        logger.warn(
          { slug, status: res.status },
          "could not fetch Clerk email template",
        );
        continue;
      }
      const tpl = (await res.json()) as ClerkEmailTemplate;
      const fields = [tpl.subject, tpl.markup, tpl.body];
      if (!fields.some((f) => f && NEEDS_FIX.test(f))) continue;

      const upsert = await fetch(
        `https://api.clerk.com/v1/templates/email/${slug}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            name: tpl.name,
            subject: rebrand(tpl.subject),
            markup: rebrand(tpl.markup),
            body: rebrand(tpl.body),
            delivered_by_clerk: tpl.delivered_by_clerk,
          }),
        },
      );
      if (!upsert.ok) {
        const text = await upsert.text();
        logger.warn(
          { slug, status: upsert.status, response: text.slice(0, 300) },
          "failed to update Clerk email template",
        );
        continue;
      }
      logger.info({ slug }, "updated Clerk email template branding");
    } catch (err) {
      logger.warn({ err, slug }, "error updating Clerk email template");
    }
  }
}
