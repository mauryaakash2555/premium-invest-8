# Deployment Readiness Checklist — Production (2026-01-02)

## Environment Variables (Production)
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
- GROQ_API_KEY
- ANTHROPIC_API_KEY
- RESEND_API_KEY
- RESEND_FROM_EMAIL
- COHERE_API_KEY (if used)
- HUGGINGFACE_API_KEY (if used)
- MISTRAL_API_KEY (if used)
- CRON_SECRET (if cron endpoints used)
- FAMILY_ADMIN_PASSWORD
- SUPER_ADMIN_PASSWORD
- PUBLIC_DASHBOARD_URL=https://bmwealth.co.in
- FEATURE_SMART_SMALLTALK_REDIRECT=true

## Feature Flags
- Server runtime: FEATURE_SMART_SMALLTALK_REDIRECT=true
- Client build-time: NEXT_PUBLIC_FEATURE_SMART_SMALLTALK_REDIRECT=true

## Pre-Deploy Validation
- Automated API test suite passes (Feature #13 + intent + hot lead + cache + rate limit)
- Manual staging UI checks pass for critical paths and security
- Performance acceptable: homepage <3s; admin <5s; mobile usable

## Merge & Deploy
```
# Merge staging changes into main
git checkout main
git pull origin main
git merge staging
git push origin main
# Vercel auto-deploys to production
```

## Post-Deploy Verification
- Visit https://bmwealth.co.in
- Validate chat (public providers), family admin (7287), super admin (/admin-secret-akash)
- Monitor logs for 1 hour; check error rates
- Validate hot-lead emails and affiliate link tracking
- Confirm cache hit rate increases on repeated queries

## Rollback Plan
- Vercel → Deployments → Previous deployment → "Promote to Production"
- Instant rollback if any critical issue is found
