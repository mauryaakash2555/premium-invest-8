# Contributing to Premium Invest 8 (BM Wealth)

## 🚨 CRITICAL: Deployment Rules

**READ THIS FIRST BEFORE ANY DEPLOYMENT**

This project uses a **STAGING-FIRST workflow** to protect the live business website.

### Deployment Rules for AI Assistants

1. **NEVER deploy directly to main/production**
2. **ALWAYS deploy to staging branch first**
3. **ONLY humans can promote staging to production**

See detailed rules in:
- `.cursorrules` - Cursor AI configuration
- `AI_DEPLOYMENT_RULES.md` - Complete AI deployment guide
- `DEPLOYMENT_WORKFLOW.md` - Step-by-step workflow

---

## Branch Structure

- **main** - Production branch (PROTECTED)
  - Auto-deploy: DISABLED
  - Manual promotion only
  - Serves: bmwealth.co.in

- **staging** - Testing branch (OPEN)
  - Auto-deploy: ENABLED
  - AI deployments allowed
  - Serves: staging.premium-invest-8.vercel.app

---

## Development Workflow

### For AI Assistants

```bash
# 1. Switch to staging branch
git checkout staging

# 2. Make your changes
# (edit files)

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Push to staging (Vercel auto-deploys)
git push origin staging

# 5. STOP - Let human test staging
# 6. Human will promote to production if tests pass
```

### For Human Developers

```bash
# Work on feature branch
git checkout -b feature/your-feature
# Make changes
git add .
git commit -m "Your changes"

# Merge to staging for testing
git checkout staging
git merge feature/your-feature
git push origin staging

# Test on staging URL
# If tests pass, promote to production manually
```

---

## Testing Checklist

Before promoting to production:

- [ ] All pages load correctly
- [ ] Mobile view works (test on real device)
- [ ] Desktop view works
- [ ] Forms submit successfully
- [ ] Images load properly
- [ ] Navigation works
- [ ] No console errors
- [ ] Performance is acceptable

---

## Pull Request Process

1. Create feature branch from `staging`
2. Make changes and commit
3. Push to feature branch
4. Create PR to merge into `staging` (NOT main)
5. Test on staging after merge
6. If tests pass, human promotes to production

---

## Emergency Procedures

### Production is Broken

1. **DO NOT** push new fixes to main
2. **GO TO** Vercel dashboard
3. **FIND** last working deployment
4. **PROMOTE** it to production (instant rollback)
5. **FIX** issue on staging
6. **TEST** thoroughly
7. **PROMOTE** when ready

---

## Code Standards

- Use ES6+ JavaScript
- Follow existing code style
- Test changes locally before pushing
- Keep commits focused and atomic
- Write clear commit messages

---

## Project Structure

```
premium-invest-8/
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── App.js       # Main app
│   │   └── App.css      # Global styles
│   └── package.json     # Dependencies
├── .cursorrules         # AI deployment rules
├── AI_DEPLOYMENT_RULES.md
└── DEPLOYMENT_WORKFLOW.md
```

---

## Getting Help

- Read `AI_DEPLOYMENT_RULES.md` for deployment questions
- Read `DEPLOYMENT_WORKFLOW.md` for workflow details
- Check existing issues on GitHub
- Contact repository owner

---

## License

This is a private business website. All rights reserved.

---

**Remember: STAGING FIRST, ALWAYS. No exceptions.**
