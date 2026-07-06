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
      if (!fields.some((f) => f && /\{\{\s*app\.name\s*\}\}/.test(f))) continue;

      const upsert = await fetch(
        `https://api.clerk.com/v1/templates/email/${slug}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            name: tpl.name,
            subject: tpl.subject
              ? tpl.subject.replace(APP_NAME_VAR, APP_NAME)
              : tpl.subject,
            markup: tpl.markup
              ? tpl.markup.replace(APP_NAME_VAR, APP_NAME)
              : tpl.markup,
            body: tpl.body ? tpl.body.replace(APP_NAME_VAR, APP_NAME) : tpl.body,
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
