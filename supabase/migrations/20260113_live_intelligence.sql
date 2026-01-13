-- ═══════════════════════════════════════════════════════════════════════════
-- LIVE INTELLIGENCE - DATABASE SCHEMA
-- 
-- Tables for the Live Intelligence headline system
-- Run this migration in Supabase SQL Editor
-- 
-- @file supabase/migrations/20260113_live_intelligence.sql
-- @created January 13, 2026
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- HEADLINES TABLE
-- Stores admin-created headlines and any manual entries
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS live_intelligence_headlines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Content
  category TEXT NOT NULL,
  icon TEXT DEFAULT '📰',
  headline TEXT NOT NULL,
  why_it_matters TEXT,
  
  -- Urgency: BREAKING, IMPORTANT, REGULAR, EDUCATIONAL, PREMIUM
  urgency TEXT NOT NULL DEFAULT 'REGULAR',
  
  -- Data display
  data_point TEXT,
  source TEXT DEFAULT 'Admin',
  
  -- CTA Button (JSON: {text, link, icon})
  cta_button JSONB,
  
  -- Validity period
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_breaking BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active headlines query
CREATE INDEX idx_headlines_active 
ON live_intelligence_headlines(is_active, created_at DESC);

-- Index for category filter
CREATE INDEX idx_headlines_category 
ON live_intelligence_headlines(category, is_active);

-- Index for validity check
CREATE INDEX idx_headlines_validity 
ON live_intelligence_headlines(valid_from, valid_until, is_active);


-- ─────────────────────────────────────────────────────────────────────────────
-- BREAKING NEWS LOG
-- History of all breaking news alerts triggered
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS breaking_news_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  headline TEXT NOT NULL,
  category TEXT DEFAULT 'breaking',
  duration_ms INTEGER DEFAULT 30000,
  
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  triggered_by TEXT
);

-- Index for recent breaking news
CREATE INDEX idx_breaking_news_recent 
ON breaking_news_log(triggered_at DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- RSS CACHE TABLE
-- Caches RSS feed content to reduce external API calls
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rss_feed_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  feed_url TEXT NOT NULL UNIQUE,
  source_name TEXT,
  
  content TEXT,
  last_fetched TIMESTAMPTZ DEFAULT NOW(),
  
  -- Cache expiry (default 5 minutes)
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes'
);

-- Index for cache lookup
CREATE INDEX idx_rss_cache_url 
ON rss_feed_cache(feed_url);


-- ─────────────────────────────────────────────────────────────────────────────
-- LIVE INTELLIGENCE ANALYTICS
-- Tracks user engagement with headlines
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS live_intelligence_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Event type: view, click, share, filter, mode_change
  event_type TEXT NOT NULL,
  
  -- Related IDs
  headline_id UUID REFERENCES live_intelligence_headlines(id),
  category TEXT,
  mode TEXT,
  
  -- User info (anonymous)
  session_id TEXT,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX idx_analytics_event 
ON live_intelligence_analytics(event_type, created_at DESC);

CREATE INDEX idx_analytics_headline 
ON live_intelligence_analytics(headline_id, created_at DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE live_intelligence_headlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaking_news_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feed_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_intelligence_analytics ENABLE ROW LEVEL SECURITY;

-- Public read for headlines
CREATE POLICY "Public can read active headlines" 
ON live_intelligence_headlines FOR SELECT 
USING (is_active = true);

-- Admin write for headlines
CREATE POLICY "Service role can manage headlines" 
ON live_intelligence_headlines FOR ALL 
USING (auth.role() = 'service_role');

-- Breaking news log - service role only
CREATE POLICY "Service role can manage breaking news log" 
ON breaking_news_log FOR ALL 
USING (auth.role() = 'service_role');

-- RSS cache - service role only
CREATE POLICY "Service role can manage RSS cache" 
ON rss_feed_cache FOR ALL 
USING (auth.role() = 'service_role');

-- Analytics - insert for all, read for service role
CREATE POLICY "Anyone can insert analytics" 
ON live_intelligence_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can read analytics" 
ON live_intelligence_analytics FOR SELECT 
USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED DATA (Sample headlines)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO live_intelligence_headlines 
  (category, icon, headline, why_it_matters, urgency, data_point, source)
VALUES
  ('market', '📈', 'Markets rally on strong Q3 earnings outlook', 
   'Positive sentiment could continue into next week', 
   'IMPORTANT', 'NIFTY: 25,047 (+0.38%)', 'NSE'),
  
  ('mutual_funds', '💰', 'SIP inflows hit record ₹19,200 Cr in December', 
   'Retail investor confidence remains strong despite volatility', 
   'REGULAR', '₹19,200 Cr', 'AMFI'),
  
  ('breaking', '🔴', 'RBI hints at possible rate cut in next policy meeting', 
   'Could boost equity and debt markets if confirmed', 
   'BREAKING', NULL, 'RBI Press'),
  
  ('fixed_income', '🏦', 'SBI revises FD rates: Up to 7.25% for senior citizens', 
   'Best time to lock in fixed deposit rates before rate cut', 
   'EDUCATIONAL', '7.25% p.a.', 'SBI'),
  
  ('forex_gold', '💵', 'Gold prices steady near all-time highs', 
   'Safe haven demand continues amid global uncertainty', 
   'REGULAR', '₹62,450/10g', 'MCX');


-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to clean up expired headlines
CREATE OR REPLACE FUNCTION cleanup_expired_headlines()
RETURNS void AS $$
BEGIN
  UPDATE live_intelligence_headlines
  SET is_active = false
  WHERE valid_until IS NOT NULL 
    AND valid_until < NOW() 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to get active headlines with validity check
CREATE OR REPLACE FUNCTION get_active_headlines(p_category TEXT DEFAULT NULL)
RETURNS SETOF live_intelligence_headlines AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM live_intelligence_headlines
  WHERE is_active = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until > NOW())
    AND (p_category IS NULL OR category = p_category)
  ORDER BY 
    CASE urgency 
      WHEN 'BREAKING' THEN 1
      WHEN 'IMPORTANT' THEN 2
      WHEN 'PREMIUM' THEN 3
      WHEN 'REGULAR' THEN 4
      WHEN 'EDUCATIONAL' THEN 5
      ELSE 6
    END,
    created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
