-- ═══════════════════════════════════════════════════════════════════════════
-- LIVE INTELLIGENCE SCHEMA
-- BM Wealth AI-Driven Financial Intelligence System
-- 
-- This schema supports the fully automated pipeline:
-- RSS → Groq (parse) → Gemini (explain) → Claude (sanitize) → Supabase → UI
-- ═══════════════════════════════════════════════════════════════════════════

-- Intelligence Items - The core content table
-- Each item contains the 6 mandatory content blocks
CREATE TABLE IF NOT EXISTS public.intelligence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source metadata
  source_name TEXT NOT NULL,           -- e.g., 'RBI', 'Moneycontrol', 'ET'
  source_url TEXT,                     -- Original article URL
  source_hash TEXT UNIQUE NOT NULL,    -- Hash of source URL for deduplication
  
  -- Classification (from Groq)
  category TEXT NOT NULL CHECK (category IN (
    'market_update',
    'policy_change', 
    'economic_indicator',
    'corporate_action',
    'global_market',
    'commodity',
    'currency',
    'regulatory'
  )),
  urgency TEXT NOT NULL DEFAULT 'low' CHECK (urgency IN ('critical', 'high', 'medium', 'low')),
  
  -- The 6 MANDATORY content blocks (from Gemini)
  -- Block 1: What happened (pure facts, past/present tense)
  block_what_happened TEXT NOT NULL,
  
  -- Block 2: Why it matters (educational, NO advice, NO future tense)
  block_why_it_matters TEXT NOT NULL,
  
  -- Block 3: Where this fits (category context)
  block_where_fits TEXT NOT NULL,      -- e.g., "Affects: Mutual Funds, SIPs, Long-term portfolios"
  
  -- Block 4: Who should care (persona-level)
  block_who_cares TEXT NOT NULL,       -- e.g., "Long-term investors, SIP investors"
  
  -- Block 5: Related signals (internal system signals ONLY)
  block_signals JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Array of signal objects
  
  -- Block 6: Source + timestamp
  block_source_timestamp TEXT NOT NULL, -- e.g., "Source: RBI | Updated 12 minutes ago"
  
  -- Processing metadata
  processed_by_groq BOOLEAN DEFAULT FALSE,
  processed_by_gemini BOOLEAN DEFAULT FALSE,
  sanitized_by_claude BOOLEAN DEFAULT FALSE,
  compliance_flagged BOOLEAN DEFAULT FALSE,
  compliance_notes TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'dropped')),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_intelligence_category ON public.intelligence_items(category);
CREATE INDEX IF NOT EXISTS idx_intelligence_urgency ON public.intelligence_items(urgency DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_status ON public.intelligence_items(status);
CREATE INDEX IF NOT EXISTS idx_intelligence_published ON public.intelligence_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_created ON public.intelligence_items(created_at DESC);

-- Live Mood Text - AI-generated market mood summaries
CREATE TABLE IF NOT EXISTS public.live_mood (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The mood text (short, factual, present-tense)
  mood_text TEXT NOT NULL,             -- e.g., "Markets steady amid mixed global cues. Volatility remains moderate."
  
  -- Classification
  mood_type TEXT NOT NULL DEFAULT 'neutral' CHECK (mood_type IN ('bullish', 'bearish', 'neutral', 'volatile', 'mixed')),
  
  -- Generation metadata
  generated_by TEXT NOT NULL DEFAULT 'gemini',
  context_data JSONB,                  -- Market data used for generation
  
  -- Status
  is_active BOOLEAN DEFAULT FALSE,     -- Only one active at a time
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_mood_active ON public.live_mood(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_live_mood_created ON public.live_mood(created_at DESC);

-- RSS Feed Sources - Configuration for ingest
CREATE TABLE IF NOT EXISTS public.rss_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE,           -- e.g., 'Moneycontrol Markets'
  feed_url TEXT NOT NULL,
  category TEXT NOT NULL,              -- Default category for items from this source
  
  -- Polling configuration
  poll_interval_minutes INTEGER DEFAULT 15,
  last_polled_at TIMESTAMP WITH TIME ZONE,
  last_item_guid TEXT,                 -- For incremental fetching
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default RSS sources
INSERT INTO public.rss_sources (name, feed_url, category) VALUES
  ('Moneycontrol Markets', 'https://www.moneycontrol.com/rss/marketreports.xml', 'market_update'),
  ('Moneycontrol Business', 'https://www.moneycontrol.com/rss/business.xml', 'corporate_action'),
  ('Economic Times Markets', 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', 'market_update'),
  ('Economic Times Economy', 'https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms', 'economic_indicator'),
  ('LiveMint Markets', 'https://www.livemint.com/rss/markets', 'market_update'),
  ('RBI Press Releases', 'https://www.rbi.org.in/Scripts/RSSFeed.aspx', 'policy_change')
ON CONFLICT (name) DO NOTHING;

-- Processing Queue - For async AI processing
CREATE TABLE IF NOT EXISTS public.intelligence_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  item_id UUID REFERENCES public.intelligence_items(id) ON DELETE CASCADE,
  
  -- Processing stage
  stage TEXT NOT NULL CHECK (stage IN ('groq_parse', 'gemini_explain', 'claude_sanitize', 'publish')),
  
  -- Queue metadata
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON public.intelligence_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_stage ON public.intelligence_queue(stage);

-- Signals Reference - Predefined system signals
CREATE TABLE IF NOT EXISTS public.signal_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  signal_key TEXT NOT NULL UNIQUE,     -- e.g., 'risk_unchanged', 'no_rebalancing'
  signal_label TEXT NOT NULL,          -- e.g., 'Risk score unchanged'
  signal_description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default signals
INSERT INTO public.signal_types (signal_key, signal_label, signal_description) VALUES
  ('risk_unchanged', 'Risk score unchanged', 'Portfolio risk profile remains stable'),
  ('no_rebalancing', 'No rebalancing alerts', 'Current allocation within target ranges'),
  ('volatility_low', 'Volatility low', 'Market volatility below historical average'),
  ('volatility_moderate', 'Volatility moderate', 'Market volatility at normal levels'),
  ('volatility_high', 'Volatility high', 'Market volatility elevated'),
  ('sip_continue', 'SIP continuation recommended', 'Market conditions favor continued SIP investments'),
  ('tax_harvest_opportunity', 'Tax harvesting opportunity', 'Potential for tax-loss harvesting'),
  ('sector_rotation', 'Sector rotation signal', 'Relative sector performance shift detected')
ON CONFLICT (signal_key) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_intelligence_items_updated_at ON public.intelligence_items;
CREATE TRIGGER update_intelligence_items_updated_at
  BEFORE UPDATE ON public.intelligence_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rss_sources_updated_at ON public.rss_sources;
CREATE TRIGGER update_rss_sources_updated_at
  BEFORE UPDATE ON public.rss_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
