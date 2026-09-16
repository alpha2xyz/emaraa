import { next } from "@vercel/functions";

/**
 * Demo-only access gate.
 *
 * The demo deployment (emaraa-demo.vercel.app) used to sit behind Vercel Authentication,
 * which bounced every visit to a Vercel login and made the demo unusable on a phone.
 * This replaces it with a gate on our own side: the same admin username and password that
 * already guard /admin, and a session that expires one hour after login.
 *
 * It has to live in middleware rather than Express because vercel.json only routes
 * /api/:proxy* through the function — every HTML request is served straight from the CDN,
 * where server code never runs.
 *
 * This is a "keep strangers out of the demo" gate, not a security boundary. The data behind
 * it is seeded and fake, the deployment has no SMTP and no SMS credentials, and the app's own
 * OTP and admin auth still apply underneath it.
 */

const PRODUCTION_PROJECT_REF = "txzbzpnrclkdodosbndy";
const COOKIE_NAME = "demo_gate";

// Reachable without the cookie: the endpoint the gate form posts to (otherwise there is no way
// in), and the cron routes, which carry their own CRON_SECRET. Every page, /admin included,
// sits behind the gate.
const OPEN_PATHS = [/^\/api\/admin\/login\/?$/, /^\/api\/cron\//];

/**
 * Same shape as server/app.ts's boot guards, and for the same reason. DEMO_GATE_ENABLED set
 * on the wrong project would redirect every emaraa.app visitor to /admin — an outage, from one
 * dashboard typo. The flag is therefore never trusted alone: the database behind the deployment
 * must also not be production.
 */
function gateIsOn(): boolean {
  if (process.env.DEMO_GATE_ENABLED !== "true") return false;
  return !(process.env.SUPABASE_URL ?? "").includes(PRODUCTION_PROJECT_REF);
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

function equalsConstantTime(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Cookie is `<expiryEpochMs>.<hex hmac-sha256 of that same string>`, issued by
 * server/demo-gate.ts. Expiry is read from the signed payload rather than trusted to
 * Max-Age, since a client controls when it actually drops a cookie.
 */
async function cookieIsValid(raw: string | null, secret: string): Promise<boolean> {
  if (!raw) return false;
  const dot = raw.lastIndexOf(".");
  if (dot === -1) return false;
  const expiry = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  if (!/^\d+$/.test(expiry) || Number(expiry) <= Date.now()) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(expiry));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return equalsConstantTime(signature, expected);
}

/**
 * Self-contained on purpose. It is served before anything the SPA owns, so it cannot import a
 * component, a token file, or a font from the bundle. Colours and wording mirror
 * client/src/pages/admin-login-page.tsx so it reads as the same door, and the labels are that
 * page's existing strings rather than new copy.
 */
const GATE_PAGE = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>عِمارة · النسخة التجريبية</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;
    background:radial-gradient(1200px 600px at 50% -10%,#193546 0%,#0F2733 55%,#0A1C25 100%);
    color:#EAF6FB;font-family:"Cairo","Segoe UI",Tahoma,system-ui,-apple-system,sans-serif}
  .card{width:100%;max-width:420px;background:rgba(25,53,70,.72);border:1px solid rgba(159,194,211,.18);
    border-radius:16px;padding:32px 24px;backdrop-filter:blur(8px);box-shadow:0 24px 60px rgba(0,0,0,.35)}
  .badge{width:64px;height:64px;margin:0 auto 16px;border-radius:50%;background:rgba(13,184,211,.18);
    display:flex;align-items:center;justify-content:center}
  h1{margin:0;text-align:center;font-size:24px;font-weight:700}
  .sub{margin:6px 0 24px;text-align:center;color:#9FC2D3;font-size:14px}
  .en{display:block;font-size:12px;color:#7FA7BA;margin-top:2px}
  label{display:block;margin-bottom:8px;font-size:14px;color:#D6E9F2}
  input{width:100%;padding:11px 12px;margin-bottom:16px;border-radius:8px;font-size:15px;color:#fff;
    background:rgba(15,39,51,.7);border:1px solid rgba(159,194,211,.22);font-family:inherit}
  input:focus{outline:none;border-color:#0DB8D3;box-shadow:0 0 0 3px rgba(13,184,211,.15)}
  button{width:100%;padding:12px;border:0;border-radius:8px;background:#0DB8D3;color:#04222c;
    font-size:16px;font-weight:700;font-family:inherit;cursor:pointer}
  button:disabled{opacity:.6;cursor:default}
  .err{display:none;margin:0 0 14px;text-align:center;color:#F87171;font-size:14px}
  .note{margin:18px 0 0;text-align:center;color:#7FA7BA;font-size:12px;line-height:1.7}
</style>
</head>
<body>
  <form class="card" id="gate">
    <div class="badge">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0DB8D3" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    </div>
    <h1>النسخة التجريبية</h1>
    <p class="sub">الدخول بنفس بيانات لوحة الإدارة<span class="en">Demo environment · sign in with the admin credentials</span></p>
    <p class="err" id="err">اسم المستخدم أو كلمة المرور غير صحيحة</p>
    <label for="u">اسم المستخدم</label>
    <input id="u" name="username" autocomplete="username" required>
    <label for="p">كلمة المرور</label>
    <input id="p" name="password" type="password" autocomplete="current-password" required>
    <button type="submit" id="go">تسجيل الدخول</button>
    <p class="note">تنتهي الجلسة تلقائياً بعد ساعة من الدخول<span class="en">Session expires one hour after login</span></p>
  </form>
<script>
  var f=document.getElementById('gate'),b=document.getElementById('go'),e=document.getElementById('err');
  f.addEventListener('submit',async function(ev){
    ev.preventDefault(); e.style.display='none'; b.disabled=true; b.textContent='جارٍ الدخول…';
    try{
      var r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({username:document.getElementById('u').value.trim(),
                             password:document.getElementById('p').value})});
      if(r.ok){ location.reload(); return; }
      e.textContent = r.status===429 ? 'محاولات كثيرة. حاول بعد قليل.' : 'اسم المستخدم أو كلمة المرور غير صحيحة';
    }catch(_){ e.textContent='تعذّر الاتصال. حاول مرة أخرى.'; }
    e.style.display='block'; b.disabled=false; b.textContent='تسجيل الدخول';
  });
</script>
</body>
</html>`;

export default async function middleware(request: Request) {
  try {
    // TEMPORARY: proves middleware actually runs on this project (Vite SPA + a vercel.json that
    // already declares its own rewrites). Remove once the gate is confirmed working.
    if (new URL(request.url).pathname === "/__mw-check") {
      return new Response(`middleware alive, gate=${gateIsOn()}`, {
        headers: { "content-type": "text/plain" },
      });
    }

    if (!gateIsOn()) return next();

    const secret = process.env.DEMO_GATE_SECRET;
    // No secret means no cookie can ever validate, which would lock the demo out entirely.
    // Open rather than closed: this gate protects fake data, a lockout protects nothing.
    if (!secret) return next();

    const { pathname } = new URL(request.url);
    if (OPEN_PATHS.some((p) => p.test(pathname))) return next();

    if (await cookieIsValid(readCookie(request.headers.get("cookie"), COOKIE_NAME), secret)) {
      return next();
    }

    // The gate replaces Vercel Authentication, so it behaves the way that did: the login screen
    // appears in place, on whatever URL was asked for, and that same URL loads once you are in.
    // A redirect would land the visitor somewhere they did not ask to go.
    const wantsHtml = (request.headers.get("accept") ?? "").includes("text/html");
    return new Response(wantsHtml ? GATE_PAGE : JSON.stringify({ error: "Demo gate" }), {
      status: 401,
      headers: {
        "content-type": wantsHtml ? "text/html; charset=utf-8" : "application/json",
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  } catch {
    // A gate that 500s on the demo is worse than a gate that lets someone look at seeded data.
    return next();
  }
}

export const config = {
  // Static assets are excluded so the admin login page can actually load its own bundle while
  // the rest of the site is still gated.
  matcher: [
    "/((?!assets/|fonts/|images/|favicon|robots\\.txt|sitemap|.*\\.(?:js|mjs|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|map|txt|xml|pdf)$).*)",
  ],
};
