// Emaraa brand X (Twitter) auto-poster.
// Brand voice (§7ج), content-only. NO auto-follow/like/reply — content posting only.
//
// Usage:
//   node post.js --whoami                 verify the 4 API keys authenticate
//   node post.js posts-batch-1.json        DRY RUN — print what would post (default, safe)
//   node post.js posts-batch-1.json --send  actually publish the whole batch
//   node post.js posts-batch-1.json --id p1 --send   publish only item "p1"
//
// Keys are read from Emaraa/.env (never the account password):
//   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load secrets from the app's .env (two levels up: tools/x-bot -> Emaraa)
dotenv.config({ path: resolve(__dirname, '../../.env') });

const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env;

function requireKeys() {
  const missing = ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_SECRET']
    .filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`\nMissing keys in Emaraa/.env: ${missing.join(', ')}`);
    console.error('Add them, then re-run. See tools/x-bot/README.md for how to get them.\n');
    process.exit(1);
  }
}

function client() {
  requireKeys();
  return new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_SECRET,
  });
}

// X free tier = 280 chars per tweet. Warn (do not silently truncate).
function checkLen(text, label) {
  const len = [...text].length;
  if (len > 280) console.warn(`  ⚠ ${label}: ${len} chars (over 280 — will be rejected by X)`);
  return len;
}

async function whoami() {
  const me = await client().v2.me();
  console.log(`\nAuthenticated as: @${me.data.username} (${me.data.name}) — keys work.\n`);
}

async function postSingle(api, text, send) {
  checkLen(text, 'single');
  if (!send) { console.log(`  [dry] ${text}\n`); return; }
  const res = await api.v2.tweet(text);
  console.log(`  posted https://x.com/i/web/status/${res.data.id}\n`);
}

async function postThread(api, tweets, send) {
  tweets.forEach((t, i) => checkLen(t, `thread ${i + 1}`));
  if (!send) {
    tweets.forEach((t, i) => console.log(`  [dry] (${i + 1}/${tweets.length}) ${t}`));
    console.log('');
    return;
  }
  let lastId;
  for (const t of tweets) {
    const payload = lastId ? { text: t, reply: { in_reply_to_tweet_id: lastId } } : { text: t };
    const res = await api.v2.tweet(payload);
    lastId = res.data.id;
  }
  console.log(`  posted thread (${tweets.length} tweets) — head https://x.com/i/web/status/${lastId}\n`);
}

async function runBatch(file, { send, onlyId }) {
  const items = JSON.parse(readFileSync(resolve(process.cwd(), file), 'utf8'));
  const api = send ? client() : null;
  for (const item of items) {
    if (onlyId && item.id !== onlyId) continue;
    console.log(`• ${item.id} [${item.type}/${item.audience}]`);
    if (item.type === 'thread') await postThread(api, item.tweets, send);
    else await postSingle(api, item.text, send);
  }
  if (!send) console.log('DRY RUN — nothing was published. Add --send to post for real.\n');
}

// ---- CLI ----
const args = process.argv.slice(2);
const send = args.includes('--send');
const onlyId = args.includes('--id') ? args[args.indexOf('--id') + 1] : null;
const file = args.find((a) => a.endsWith('.json'));

if (args.includes('--whoami')) {
  whoami().catch((e) => { console.error(e.message || e); process.exit(1); });
} else if (file) {
  runBatch(file, { send, onlyId }).catch((e) => { console.error(e.message || e); process.exit(1); });
} else {
  console.log('Usage: node post.js --whoami | node post.js <batch.json> [--send] [--id <id>]');
}
