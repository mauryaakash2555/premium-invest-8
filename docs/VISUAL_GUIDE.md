# Visual Project Map 🗺️

This guide explains the project like LEGO blocks.
If you know “folders hold files”, you can maintain this project.

## What Each Folder Does (Explained Simply)

```text
📁 premium-invest-8 (Your project)
│
├─ 📁 app (Pages + APIs)
│  ├─ 📁 api (Backend: database + AI)
│  │  ├─ 📁 chat → 📄 route.js  (user messages) 🤖
│  │  ├─ 📁 leads → 📄 route.js (save name/email/phone) 💾
│  │  ├─ 📁 health → 📄 route.js (health check) ✅
│  │  ├─ 📁 track → 📄 route.js (tracking events) 📍
│  │  └─ 📁 admin (admin-only APIs) 🎛️
│  │     ├─ 📁 summary → 📄 route.js
│  │     ├─ 📁 analytics → 📄 route.js
│  │     ├─ 📁 revenue → 📄 route.js
│  │     └─ 📁 strategy → 📄 route.js
│  │
│  ├─ 📁 (public) → 📄 page.jsx (homepage) 🏠
│  └─ 📁 admin-secret-xyz → 📄 page.jsx (hidden admin page) 🔒
│
├─ 📁 components (UI pieces)
│  ├─ 📁 user → 💬 AIChatFloat.jsx (chat popup)
│  ├─ 📁 admin → 🎛️ AdminDashboard.jsx (admin UI)
│  ├─ 📁 shared (used by both)
│  └─ 📁 ui (UI library pieces)
│
├─ 📁 lib (tools/helpers)
│  ├─ 📁 ai (AI providers + orchestrator)
│  │  ├─ 📄 gemini.js
│  │  ├─ 📄 groq.js
│  │  ├─ 📄 claude.js
│  │  ├─ 📄 provider.js (auto-picks a provider) 🔁
│  │  └─ 📄 contextManager.js (memory) 🧠
│  │
│  ├─ 📁 db (database functions)
│  │  ├─ 📄 leads.js
│  │  ├─ 📄 conversations.js
│  │  └─ 📄 events.js
│  │
│  ├─ 📁 plugins (optional add-ons)
│  └─ 📁 utils (small helpers)
│
├─ 📁 config (settings)
│  ├─ 📄 constants.js (all settings) ⚙️
│  ├─ 📄 env.js (env validation) 🔐
│  └─ 📄 features.js (feature on/off switches) 🎚️
│
└─ 📁 docs (guides)
   ├─ 📄 COOKBOOK.md
   ├─ 📄 TROUBLESHOOTING.md
   └─ 📁 SCREENSHOTS 📸
```

## Emoji Legend

- 📁 folder
- 📄 file you edit
- 💬 user-facing chat
- 🎛️ admin tools
- ⚙️ settings
- 🔐 secrets/keys
- 🧠 AI / memory
- 🔁 fallback







