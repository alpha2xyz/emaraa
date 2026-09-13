import { sendEmail } from "./email.js";

/**
 * Durable email outbox.
 *
 * The problem it solves: POST /api/requests used to send the owner confirmation,
 * the admin notice, and then one email per approved provider as sequential awaits
 * on the request path, with no maxDuration set. At eight to ten providers that
 * request exceeds the platform timeout, and the failure mode is the worst
 * available one: the owner sees an error for a request that was in fact created,
 * and the remaining providers are never told about it.
 *
 * Why not "write rows, return, let a cron send them", as originally planned: this
 * project's crons run daily (Vercel Hobby). Draining new-request notifications
 * once a day would delay the single event that produces offers by up to 24 hours,
 * which works directly against offers-per-request, the metric this quarter is
 * measured on. So the outbox is written first for durability, then drained
 * immediately in parallel; the cron exists to retry whatever did not go out, not
 * as the primary path.
 *
 * Net effect: sends happen now, nothing is silently lost, and the request path no
 * longer scales its duration with the number of providers.
 */

export type OutboxItem = {
  to_email: string;
  subject: string;
  html: string;
  kind: string;
};

/** Writes pending rows. Fast, one insert, regardless of recipient count. */
export async function enqueueEmails(
  supabaseAdmin: any,
  items: OutboxItem[]
): Promise<string[]> {
  if (items.length === 0) return [];
  const { data, error } = await supabaseAdmin
    .from("email_outbox")
    .insert(items.map((i) => ({ ...i, status: "pending", attempts: 0 })))
    .select("id");
  if (error) {
    console.error("[outbox] enqueue failed:", error.message);
    return [];
  }
  return (data ?? []).map((r: any) => r.id);
}

/**
 * Sends pending rows in parallel and records the outcome of each.
 *
 * Parallel rather than sequential is the actual fix for the timeout: ten sends
 * take about as long as one. Promise.allSettled so a single bad address cannot
 * abort the batch.
 */
export async function drainOutbox(
  supabaseAdmin: any,
  opts: { ids?: string[]; limit?: number; maxAttempts?: number } = {}
): Promise<{ sent: number; failed: number }> {
  const maxAttempts = opts.maxAttempts ?? 3;

  let q = supabaseAdmin
    .from("email_outbox")
    .select("id, to_email, subject, html, kind, attempts")
    .eq("status", "pending")
    .lt("attempts", maxAttempts);

  if (opts.ids?.length) q = q.in("id", opts.ids);
  q = q.order("created_at", { ascending: true }).limit(opts.limit ?? 100);

  const { data: rows, error } = await q;
  if (error || !rows?.length) return { sent: 0, failed: 0 };

  const results = await Promise.allSettled(
    rows.map(async (row: any) => {
      await sendEmail(supabaseAdmin, {
        to: row.to_email,
        subject: row.subject,
        html: row.html,
        kind: row.kind,
      });
      return row.id;
    })
  );

  let sent = 0;
  let failed = 0;
  await Promise.allSettled(
    results.map((r, i) => {
      const row = rows[i];
      if (r.status === "fulfilled") {
        sent++;
        return supabaseAdmin
          .from("email_outbox")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", row.id);
      }
      failed++;
      const attempts = (row.attempts ?? 0) + 1;
      return supabaseAdmin
        .from("email_outbox")
        .update({
          attempts,
          // Give up after maxAttempts so a permanently bad address stops being retried.
          status: attempts >= maxAttempts ? "failed" : "pending",
          last_error: String((r as PromiseRejectedResult).reason).slice(0, 500),
        })
        .eq("id", row.id);
    })
  );

  return { sent, failed };
}
