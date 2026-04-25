# Emaraa — Daily Wrap-Up Report
**Date:** 2026-04-20

---

## ✅ Completed Today

### Step 4b — Private Storage Buckets
- Created `client/src/lib/storage.ts` — `openSignedPdf(bucket, path)` helper generating 1-hour signed URLs (handles legacy public URLs too)
- `provider-offer-form.tsx` — now stores file path instead of public URL in DB
- `admin-dashboard.tsx` — removed `getDocumentUrl` public URL helper; CR doc, company profile, and offer PDF buttons all use `openSignedPdf`
- `owner-offers-page.tsx` — offer view button uses `openSignedPdf`
- `provider-offers.tsx` — offer view button uses `openSignedPdf`

### Manual Steps Done by User
- Supabase: both `provider-documents` and `provider-offers` buckets toggled to **private**
- All revised files uploaded to Replit

### UI Fix — Toast Notifications
- `client/src/components/ui/toast.tsx` — dark background (`bg-gray-900`), black text for readability
- Destructive toast: `bg-red-600` solid red, black text

---

## 🐛 Workflow Issues Found (Audit — not yet fixed)

### 🔴 High Priority
1. **Query key mismatch** — `provider-offer-form.tsx:231`
   - Invalidates `["/api/provider/offers"]` but page queries `["/api/provider/all-offers"]`
   - Result: provider won't see new offer without manual page reload

2. **Settings page broken for owners** — `settings.tsx:142`
   - Profile button always goes to `/dashboard/provider/profile` regardless of role
   - Result: owners get sent to wrong page

3. **Auth page loses role on mode toggle** — `auth-page.tsx:307`
   - Switching login ↔ register drops the role query param
   - Result: user could accidentally register as wrong role

4. **No query cache clear on logout** — `Navbar.tsx:12`
   - localStorage cleared but `queryClient.clear()` not called
   - Result: cached user data persists, could leak on shared devices

### 🟡 Medium Priority
5. **No request delete** — `requests.tsx`
   - Owners can edit requests but cannot delete them

6. **Missing auth guards** on several pages (requests, properties, provider pages, offer form)
   - Low practical risk since Supabase queries return nothing without auth, but direct URL access shows blank/broken pages instead of redirecting to login

### 🟢 Low Priority
7. **Request form edit mode skips limit check** — `request-form.tsx:151`
8. **Landing page login defaults to owner role** — `landing-page.tsx:124`
9. **Contact page no bottom nav on mobile** — `contact-page.tsx`
10. **Admin approval has no loading state** — `admin-dashboard.tsx`

---

## 🚀 Publish Readiness Audit

| Area | Status | Notes |
|------|--------|-------|
| package.json scripts | ✅ Done | build / start / dev all configured |
| vite.config.ts | ✅ Done | output dir, aliases, base path all correct |
| SEO (title, meta, OG, favicon) | ✅ Done | All present in `client/index.html` |
| 404 page | ✅ Done | Catch-all route → `not-found.tsx` |
| Mobile responsiveness | ✅ Done | sm/md breakpoints used throughout |
| Broken imports / build | ✅ Done | Build succeeds, no broken imports |
| Replit config (.replit) | ✅ Done | Deploy target, port, build/start commands set |
| Error Boundary | ❌ Missing | No React ErrorBoundary — app will white-screen on crash |
| Supabase keys in source code | ⚠️ Needs fix | Keys hardcoded in `client/src/lib/supabase.ts` — should use `import.meta.env.VITE_*` |
| Bundle size | ⚠️ Warning | Main JS bundle is ~600KB — consider code splitting |

### 🔴 Must Do Before Publishing
1. **Move Supabase keys to env vars** — `client/src/lib/supabase.ts` should read from `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY` instead of hardcoded values. Keys are already in `.replit` env vars — just wire them up.
2. **Add React Error Boundary** — wrap `<Router />` in `App.tsx` so crashes show a friendly error page instead of blank white screen.

### 🟡 Nice to Have Before Publishing
3. **Code splitting** — reduce 600KB bundle by lazy-loading routes
4. Fix all 🔴 High Priority workflow issues listed above

---

## 📋 Still Pending
- Step 2 SQL (security): run in Supabase SQL Editor if not done yet
- Fix items above before going live
