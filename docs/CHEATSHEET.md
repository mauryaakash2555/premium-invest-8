# Quick Reference Cheat Sheet 📋

## 🎯 Most Common Tasks

| What you want | File to edit | How to find it |
|---|---|---|
| Change colors | `config/constants.js` | Ctrl+F → `COLORS` |
| Change welcome text | `components/user/AIChatFloat.jsx` | Ctrl+F → `COMPLIANCE_TEXT` |
| Change admin password | `.env.local` | `ADMIN_PASSWORD=` |
| Turn feature on/off | `.env.local` | `FEATURE_...=` |
| Change bot style | `app/api/chat/route.js` | Ctrl+F → `System prompt` |

## 📞 API Endpoints

| URL | What it does |
|---|---|
| `POST /api/chat` | Send message → get reply |
| `POST /api/leads` | Save name/email/phone |
| `GET /api/admin/summary` | Admin stats |
| `GET /api/health` | Health check |

## ⌨️ Shortcuts

| Action | Shortcut |
|---|---|
| Save | Ctrl+S |
| Search | Ctrl+F |
| Refresh | Ctrl+R |
| Hard refresh | Ctrl+Shift+R |
| Console | F12 |

## 🚀 Commands

```bash
npm run dev
npm run build
npm run validate:chat
```


