# Emaraa X (Twitter) Bot

Brand-voiced auto-posting for Emaraa's X account. **Content only** — it posts tweets and threads.
It does **not** follow, like, or reply to anyone (that violates X rules and gets accounts suspended).

Voice = Emaraa the brand (BRAND-VOICE §7ج), **not** the founder. See memory `project_x_account`.

## One-time setup (Abdallah)

1. **Create the X account** as the brand (suggest handle `@emaraaapp`), Arch logo avatar, brand bio.
2. Go to **developer.x.com** → sign up for the **Free** plan → create a Project + App.
3. In the App settings → **User authentication settings** → set permissions to **Read and Write**.
4. Open **Keys and tokens** and generate all four:
   - API Key  → `X_API_KEY`
   - API Key Secret → `X_API_SECRET`
   - Access Token → `X_ACCESS_TOKEN`
   - Access Token Secret → `X_ACCESS_SECRET`
   (Regenerate the Access Token/Secret *after* setting Read+Write, or it stays read-only.)
5. Paste the four into `Emaraa/.env` (same file the app uses). Hand them to Claude — never the password.

## Install & test (Claude runs these)

```bash
cd Emaraa/tools/x-bot
npm install
npm run test-auth          # confirms the keys authenticate: "Authenticated as: @emaraaapp"
node post.js posts-batch-1.json            # DRY RUN — prints what would post, posts nothing
node post.js posts-batch-1.json --id p1 --send   # publish ONE post as a real test
node post.js posts-batch-1.json --send     # publish the whole batch
```

Default is always a safe **dry run**. Nothing publishes without `--send`.

## How the weekly loop works

1. Claude generates the next `posts-batch-N.json` in Emaraa brand voice (50% owner / 50% B2B).
2. A `/schedule` routine publishes them on a cadence (4–5/week).
3. Abdallah pastes the weekly X analytics screenshot → Claude tunes hooks/timing/topics for the next batch.

Free tier = posting only (no analytics read), which is why tuning is screenshot-driven.
