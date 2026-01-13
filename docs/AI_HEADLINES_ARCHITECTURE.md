# AI Headlines System Architecture

## Overview
Multi-AI pipeline for generating, filtering, and validating financial news content that drives traffic to the website.

## Available Free/Low-Cost AI Options

### Tier 1: News Collection & Initial Filtering (FREE)
| AI Service | Purpose | Free Tier | Notes |
|------------|---------|-----------|-------|
| **Grok** (xAI) | Real-time news/X posts | Free via X/Twitter | Best for live market sentiment |
| **Perplexity** | News aggregation | 5 queries/day free | Good for source verification |
| **Google News API** | News feeds | Limited free tier | RSS alternative |
| **NewsAPI.org** | Headlines | 100 req/day free | Dev tier available |
| **Finnhub** | Financial news | 60 calls/min free | Market-specific news |
| **Alpha Vantage** | Market data + news | 5 calls/min free | Stock news focus |
| **Polygon.io** | Market news | Limited free | Real-time ticker news |

### Tier 2: Content Processing (FREE/LOW-COST)
| AI Service | Purpose | Free Tier | Notes |
|------------|---------|-----------|-------|
| **ChatGPT-3.5** | Content filtering | Rate-limited | Good for basic processing |
| **Hugging Face** | Summarization | Free models | Local/API options |
| **Cohere** | Text processing | 100 calls/month | Good summarizer |
| **Mistral AI** | Content generation | Free API tier | Open source alternative |
| **LLaMA** (via Groq) | Fast inference | Free tier available | Very fast processing |
| **Together AI** | Multiple models | $25 free credits | Good for bulk processing |

### Tier 3: SEBI Compliance Check (PAID - USE SPARINGLY)
| AI Service | Purpose | Cost | Notes |
|------------|---------|------|-------|
| **Gemini Pro** | SEBI validation | Free tier + pay | First line compliance |
| **Claude** | Final SEBI check | Pay per token | Last resort only |

---

## Recommended Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                     NEWS COLLECTION (FREE)                          │
├─────────────────────────────────────────────────────────────────────┤
│  Grok → Real-time X/Twitter sentiment & breaking news               │
│  NewsAPI → Headline aggregation                                     │
│  Finnhub → Market-specific financial news                          │
│  Alpha Vantage → Stock-specific news                               │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│              INITIAL FILTERING (FREE - HIGH VOLUME)                 │
├─────────────────────────────────────────────────────────────────────┤
│  Grok/Mistral/LLaMA via Groq:                                      │
│  • Remove duplicates                                                │
│  • Categorize by sector (Banking, IT, Pharma, etc.)                │
│  • Score relevance (1-10)                                          │
│  • Extract key data points (prices, percentages)                   │
│  • Flag potential SEBI-sensitive content                           │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│              CONTENT ENHANCEMENT (FREE/LOW-COST)                    │
├─────────────────────────────────────────────────────────────────────┤
│  ChatGPT-3.5 / Cohere / Together AI:                               │
│  • Generate "Why It Matters" explanations                          │
│  • Create investor-friendly summaries                              │
│  • Add educational context                                         │
│  • Format for PDF generation                                       │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   PDF GENERATION (LOCAL)                            │
├─────────────────────────────────────────────────────────────────────┤
│  Using: jsPDF / Puppeteer / React-PDF                              │
│  • BM Wealth branded template                                      │
│  • Shareable format (WhatsApp-friendly)                            │
│  • Teaser content only → Full read on website                      │
│  • QR code linking back to website                                 │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│              SEBI COMPLIANCE CHECK (PAID - MINIMAL)                 │
├─────────────────────────────────────────────────────────────────────┤
│  Step 1: Gemini Pro (cheaper)                                      │
│  • Check for investment advice language                            │
│  • Verify disclaimer requirements                                  │
│  • Flag "guaranteed returns" type claims                           │
│  • If PASS → Publish                                               │
│  • If FLAGGED → Send to Claude                                     │
│                                                                     │
│  Step 2: Claude (last resort, only flagged content)                │
│  • Deep SEBI compliance review                                     │
│  • Rewrite problematic sections                                    │
│  • Add required disclaimers                                        │
│  • Final approval/rejection                                        │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     PUBLISH & DISTRIBUTE                            │
├─────────────────────────────────────────────────────────────────────┤
│  • Store in Supabase database                                      │
│  • Generate shareable PDF (teaser only)                            │
│  • Push to Live Intelligence feed                                  │
│  • Enable social sharing                                           │
│  • Track engagement (clicks from PDF → website)                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Traffic Generation Strategy

### PDF Sharing Model
```
┌────────────────────────────────────────────────────────────────┐
│                    SHAREABLE PDF STRUCTURE                      │
├────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  BM WEALTH - Live Intelligence Report                    │   │
│  │  Date: Jan 13, 2026 | Morning Brief                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  📰 TODAY'S TOP 3 HEADLINES                                   │
│                                                                │
│  1. Nifty Crosses 25,000: Historic Milestone                  │
│     "Foreign investors pump ₹2,300cr into..."                 │
│     [Preview text only - 50 words]                            │
│     ▶ Read full analysis at bmwealth.in/live                  │
│                                                                │
│  2. SBI FD Rates Revised: 7.25% for Seniors                   │
│     "Best rates in 18 months as..."                           │
│     [Preview text only - 50 words]                            │
│     ▶ Read full analysis at bmwealth.in/live                  │
│                                                                │
│  3. RBI Signals Rate Cut: What It Means                       │
│     "February policy meeting likely..."                        │
│     [Preview text only - 50 words]                            │
│     ▶ Read full analysis at bmwealth.in/live                  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔗 Get full insights: bmwealth.in/live-intelligence    │   │
│  │  [QR CODE]                                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  DISCLAIMER: This is for informational purposes only...        │
└────────────────────────────────────────────────────────────────┘
```

### Key Principles:
1. **Teaser Content Only** - Just enough to intrigue, full content on website
2. **QR Code** - Direct link to the specific article
3. **WhatsApp Optimized** - Portrait, under 1MB, clear text
4. **Daily Digest** - Morning, Afternoon, Evening editions
5. **Tracking** - UTM parameters to measure PDF → Website conversions

---

## SEBI Compliance Rules

### Content to Avoid (Auto-flag):
- "Guaranteed returns"
- Specific stock recommendations
- "Buy/Sell" language
- Future price predictions
- Performance promises

### Required Disclaimers:
```
"BM Wealth is not a SEBI registered investment advisor. 
Content is for educational purposes only. 
Past performance is not indicative of future results.
Please consult your financial advisor before investing."
```

### Gemini Prompt for SEBI Check:
```
Analyze this financial content for SEBI compliance in India:
1. Does it contain specific investment advice? (YES/NO)
2. Does it promise returns? (YES/NO)
3. Does it recommend specific stocks? (YES/NO)
4. Does it have required disclaimers? (YES/NO)
5. Risk score (1-10): 

Content: [INSERT CONTENT]
```

---

## Cost Estimation (Monthly)

| Component | Service | Estimated Cost |
|-----------|---------|----------------|
| News Collection | Free APIs | ₹0 |
| Initial Filtering | Grok/Groq | ₹0 |
| Content Processing | ChatGPT-3.5/Cohere | ₹500-1000 |
| SEBI Check (Gemini) | ~100 checks/day | ₹1000-2000 |
| SEBI Check (Claude) | ~10 checks/day | ₹500-1000 |
| PDF Generation | Local | ₹0 |
| **Total** | | **₹2000-4000/month** |

---

## Implementation Priority

### Phase 1: Basic Pipeline (Week 1-2)
- [ ] Set up NewsAPI + Finnhub connections
- [ ] Implement Grok for initial filtering
- [ ] Basic PDF template creation
- [ ] Manual SEBI review

### Phase 2: Automation (Week 3-4)
- [ ] Add ChatGPT-3.5 content enhancement
- [ ] Gemini SEBI auto-check
- [ ] Automated PDF generation
- [ ] WhatsApp share integration

### Phase 3: Scale (Week 5-6)
- [ ] Claude integration for edge cases
- [ ] Analytics dashboard
- [ ] A/B test PDF formats
- [ ] Engagement tracking

---

## Database Schema (Supabase)

```sql
-- Headlines table
CREATE TABLE headlines (
  id UUID PRIMARY KEY,
  headline TEXT NOT NULL,
  summary TEXT,
  full_content TEXT, -- Full article (website only)
  teaser TEXT, -- PDF preview
  category VARCHAR(50),
  urgency VARCHAR(20),
  source VARCHAR(100),
  source_url TEXT,
  data_point VARCHAR(100),
  sebi_status VARCHAR(20), -- pending, approved, rejected
  sebi_notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  views INTEGER DEFAULT 0,
  pdf_downloads INTEGER DEFAULT 0
);

-- AI processing log
CREATE TABLE ai_processing_log (
  id UUID PRIMARY KEY,
  headline_id UUID REFERENCES headlines(id),
  ai_service VARCHAR(50),
  step VARCHAR(50), -- collection, filtering, enhancement, sebi_check
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_estimate DECIMAL(10,4),
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Next Steps

1. **Get API Keys:**
   - NewsAPI.org (free tier)
   - Finnhub (free tier)
   - Groq (for fast LLaMA inference)
   - Gemini API (for SEBI checks)

2. **Create Services:**
   - `/lib/ai/news-collector.js`
   - `/lib/ai/content-filter.js`
   - `/lib/ai/sebi-checker.js`
   - `/lib/ai/pdf-generator.js`

3. **Set Up Cron Jobs:**
   - Morning digest: 7:00 AM
   - Live updates: Every 30 min (market hours)
   - Evening summary: 6:00 PM

Let me know when you want to start implementing!
