# How To Do Common Things 👨‍🍳

These are “recipes”. Follow steps in order.

## 🎨 1) Change Colors

**What:** Change the gold color of buttons/chat.

**Steps:**
1. Open: `config/constants.js`
2. Press **Ctrl+F** and search: `COLORS`
3. Change:

```js
PRIMARY_GOLD: "#C6A15B"
```

4. Save (Ctrl+S)
5. Refresh browser (Ctrl+R)
6. Done ✅

**Undo:** put back `#C6A15B`.

---

## 💬 2) Change Welcome Message

**What:** Change what the bot says first.

**Steps:**
1. Open: `components/user/AIChatFloat.jsx`
2. Ctrl+F: search `COMPLIANCE_TEXT` or `may I have your name`
3. Edit the first bot message text.
4. Save + refresh.

---

## 🔑 3) Change Admin Password

**What:** Change the secret code.

**Steps:**
1. Open: `.env.local`
2. Find or add:

```bash
FAMILY_ADMIN_PASSWORD_HASH=<bcrypt hash of your family PIN>
```

3. Change it to a stronger password (letters + numbers).
4. Restart server: stop (Ctrl+C) then `npm run dev`
5. Done ✅

---

## 🎚️ 4) Turn a Feature ON/OFF

**What:** Disable analytics without deleting code.

**Steps:**
1. Open: `.env.local`
2. Add:

```bash
FEATURE_ANALYTICS=false
```

3. Restart server
4. Done ✅

**Where switches live:** `config/features.js`

---

## 🤖 5) Change AI “Personality”

**What:** Make the bot more formal/casual.

**Steps:**
1. Open: `app/api/chat/route.js`
2. Ctrl+F: search `buildSeBiSafeSystemPrompt`
3. Edit the instructions text.
4. Save and test the bot.

---

## 💾 6) Fix Leads Not Saving

**Steps:**
1. Open: `http://localhost:3000/api/health`
2. If Supabase is not ok, check `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
3. In Supabase SQL editor, run: `supabase/schema.sql`

---

## 🧩 7) Add a Plugin (No touching core code)

**Goal:** Run code when a lead is captured.

**Steps:**
1. Create file: `features/plugins/EmailNotifications.js`
2. Paste:

```js
import { registerPlugin } from "@/lib/plugins/PluginManager";

registerPlugin({
  name: "EmailNotifications",
  async onLeadCapture({ lead }) {
    console.log("New lead:", lead?.email);
  },
});
```

3. Open: `features/plugins/index.js`
4. Add:

```js
import "@/features/plugins/EmailNotifications";
```

5. Restart server

---

## 🚨 8) Restore Backup (Emergency)

```bash
node scripts/safety/chat-backup.js restore-latest
npm run dev
```



