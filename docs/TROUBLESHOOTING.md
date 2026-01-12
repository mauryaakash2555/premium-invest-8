# Common Problems & Solutions 🔧

## ❌ Chat box doesn’t open

**Quick fix:** Hard refresh: **Ctrl+Shift+R**

**If still broken:**
1. Stop server (Ctrl+C)
2. Delete `.next`
3. Run:

```bash
npm run dev
```

---

## ❌ Admin password not working

**Fix:**
1. Check `.env.local` has `SUPER_ADMIN_PASSWORD_HASH=...` (or legacy `ADMIN_PASSWORD_HASH=...`)
2. Restart server
3. Clear site data (DevTools → Application → Clear site data)

---

## ❌ Bot not responding

**Fix:**
1. Open: `/api/health`
2. If AI checks are not ok → fix keys in `.env.local`
3. Restart server

---

## ❌ Leads not saving

**Fix:**
1. Open: `/api/health` and check Supabase
2. Run `supabase/schema.sql` in Supabase SQL editor

---

## 🆘 Nothing works (Nuclear option)

1. Copy `.env.local` somewhere safe
2. Delete `.next` and `node_modules`
3. Run:

```bash
npm install
npm run dev
```






