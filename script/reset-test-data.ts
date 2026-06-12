/**
 * Reset test-account data so a full flow can be re-run from onboarding.
 *
 * SAFETY: this script ONLY ever touches the phone numbers in OTP_TEST_NUMBERS,
 * and it refuses to run unless OTP_TEST_MODE === "true". Production does not set
 * OTP_TEST_MODE, so running it against a production env aborts immediately. Real
 * users are never in the test whitelist, so their data can never be deleted here.
 *
 * Run:  npm run reset:test
 * After running, the test numbers are fully removed — log in via the register
 * flow (no SMS, code 0100) to start again from onboarding.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const testNumbers = (process.env.OTP_TEST_NUMBERS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (process.env.OTP_TEST_MODE !== "true" || testNumbers.length === 0) {
  console.error(
    "Refusing to run: OTP_TEST_MODE must be 'true' and OTP_TEST_NUMBERS must be set.\n" +
      "This script only deletes data for whitelisted test numbers — it will never run against production."
  );
  process.exit(1);
}
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const db = createClient(url, key);

async function main() {
  const { data: users } = await db
    .from("users")
    .select("id, phone, role")
    .in("phone", testNumbers);

  if (!users?.length) {
    console.log(`No test users found for: ${testNumbers.join(", ")}. Nothing to reset.`);
    return;
  }
  const userIds = users.map((u) => u.id);

  const { data: reqs } = await db.from("requests").select("id").in("owner_id", userIds);
  const reqIds = (reqs ?? []).map((r) => r.id);
  const { data: provs } = await db.from("providers").select("id").in("user_id", userIds);
  const provIds = (provs ?? []).map((p) => p.id);

  // Delete children first, then parents (deals → offers → requests/properties → providers → user).
  await db.from("deals").delete().in("owner_id", userIds);
  if (provIds.length) await db.from("deals").delete().in("provider_id", provIds);
  if (reqIds.length) await db.from("provider_offers").delete().in("request_id", reqIds);
  if (provIds.length) await db.from("provider_offers").delete().in("provider_id", provIds);
  await db.from("requests").delete().in("owner_id", userIds);
  await db.from("properties").delete().in("owner_id", userIds);
  await db.from("providers").delete().in("user_id", userIds);
  await db.from("sessions").delete().in("user_id", userIds);
  await db.from("otp_rate_limits").delete().in("phone", testNumbers);
  await db.from("users").delete().in("id", userIds);

  console.log(
    `Reset complete. Removed ${users.length} test user(s) + their data: ${users
      .map((u) => `${u.phone}(${u.role})`)
      .join(", ")}\nLog in via register (code 0100) to start fresh from onboarding.`
  );
}

main().catch((e) => {
  console.error("Reset failed:", e?.message ?? e);
  process.exit(1);
});
