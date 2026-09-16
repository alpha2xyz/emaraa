/**
 * The live Supabase project. Guards that must never fire on production compare against this,
 * so the deployment's own database — not an env flag alone — decides what is allowed.
 */
export const PRODUCTION_PROJECT_REF = "txzbzpnrclkdodosbndy";
