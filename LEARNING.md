# Learning Path (Start Here!) 🎒

This project is designed so anyone can learn it step-by-step.

## ✅ Start Here Checklist (10 minutes)

1. Start the dev server:

```bash
npm run dev
```

2. Open the website:
   - http://localhost:3000
3. Open health check:
   - http://localhost:3000/api/health
4. Open admin login:
   - http://localhost:3000/admin-secret-xyz

If these work, you’re ready.

## 📚 Recommended Reading Order

1. docs/VISUAL_GUIDE.md (Where everything lives 🗺️)
2. docs/CHEATSHEET.md (fast shortcuts 📋)
3. docs/COOKBOOK.md (step-by-step recipes 👨‍🍳)
4. docs/TROUBLESHOOTING.md (what to do when stuck 🔧)
5. docs/GLOSSARY.md (what words mean 📖)
6. docs/VIDEO_TUTORIALS.md (recordable scripts 🎥)

## 🧱 The “LEGO” Rules (Simple)

1. UI lives in components/
2. Server logic lives in app/api/
3. AI code lives in lib/ai/
4. Database code lives in lib/db/
5. Settings live in config/
6. Switches live in .env.local (feature flags)

## 🧭 Learning Path (What to learn first)

### Level 1 (Beginner)
- Change colors (config/constants.js)
- Change welcome message (components/user/AIChatFloat.jsx)

### Level 2 (Intermediate)
- Toggle features (.env.local + config/features.js)
- Read health check (/api/health)

### Level 3 (Advanced)
- Change chat behavior (app/api/chat/route.js)
- Add a plugin (features/plugins/*)
- Add a new API route (app/api/.../route.js)
