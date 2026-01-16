-- ═══════════════════════════════════════════════════════════════════════════
-- BM WEALTH SERVICE HEADLINES
-- 
-- Run this in Supabase SQL Editor to add your service headlines
-- These are PERMANENT headlines about your services (no expiry)
-- 
-- @file supabase/seed_service_headlines.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- First, let's add headlines that promote your services
-- These don't expire (valid_until is NULL) so they stay forever

INSERT INTO live_intelligence_headlines 
  (category, icon, headline, why_it_matters, urgency, data_point, source, is_active, valid_until, created_by)
VALUES
  -- ═══════════════════════════════════════════════════════════════════════════
  -- MUTUAL FUNDS
  -- ═══════════════════════════════════════════════════════════════════════════
  ('mutual_funds', '💰', 'SIP inflows hit record ₹19,200 Cr in December', 
   'Retail investor confidence remains strong. Systematic investing helps navigate market volatility. Start your SIP journey with BM Wealth.', 
   'IMPORTANT', '₹19,200 Cr', 'AMFI', true, NULL, 'admin'),
  
  ('mutual_funds', '📊', 'Top Large Cap Funds delivered 15%+ returns in 2025', 
   'Large caps offer stability with growth. Diversification across market caps reduces portfolio risk. Our experts can help you choose the right funds.', 
   'REGULAR', '15%+ returns', 'BM Wealth Research', true, NULL, 'admin'),

  ('mutual_funds', '🎯', 'Flexi-cap funds: Best of both worlds for new investors', 
   'Flexi-cap funds invest across market caps giving fund managers flexibility. Ideal for investors who want professional management without worrying about timing.', 
   'EDUCATIONAL', 'Flexi-cap', 'BM Wealth', true, NULL, 'admin'),

  -- ═══════════════════════════════════════════════════════════════════════════
  -- SIP (Systematic Investment Plan)
  -- ═══════════════════════════════════════════════════════════════════════════
  ('sip', '🎯', 'Start a SIP with as little as ₹500/month', 
   'Small regular investments compound over time. SIPs help average out market volatility through rupee cost averaging. Begin your wealth journey today.', 
   'EDUCATIONAL', '₹500/month', 'BM Wealth', true, NULL, 'admin'),
  
  ('sip', '📈', 'SIP investors saw 40% higher returns over 5 years vs lumpsum', 
   'Disciplined investing through SIPs helps avoid timing mistakes and builds wealth systematically. Let our advisors set up your SIP portfolio.', 
   'REGULAR', '+40% vs lumpsum', 'AMFI Study', true, NULL, 'admin'),

  ('sip', '💎', 'Step-up SIP: Increase investment as your income grows', 
   'Increase your SIP by 10% every year to accelerate wealth creation. A ₹10,000 SIP with 10% annual step-up beats a ₹15,000 flat SIP over 20 years.', 
   'EDUCATIONAL', 'Step-up SIP', 'BM Wealth', true, NULL, 'admin'),

  -- ═══════════════════════════════════════════════════════════════════════════
  -- FIXED DEPOSITS
  -- ═══════════════════════════════════════════════════════════════════════════
  ('fixed_income', '🏦', 'Compare FD rates: SBI, HDFC, ICICI & 15+ banks', 
   'Find the best fixed deposit rates based on your tenure and amount. Senior citizens get 0.5% extra. We help you maximize safe returns.', 
   'EDUCATIONAL', 'Compare rates', 'BM Wealth', true, NULL, 'admin'),
  
  ('fixed_income', '💵', 'FD rates up to 7.25% for senior citizens', 
   'Lock in current rates before potential rate cuts. FDs offer guaranteed returns with zero market risk. Ideal for conservative investors.', 
   'IMPORTANT', '7.25% p.a.', 'Leading Banks', true, NULL, 'admin'),

  ('fixed_income', '📋', 'Tax-saving FD: ₹1.5L deduction under Section 80C', 
   '5-year tax-saving FDs qualify for 80C deduction. Get tax benefits with guaranteed returns. Premature withdrawal not allowed.', 
   'REGULAR', '₹1.5L deduction', 'Income Tax Dept', true, NULL, 'admin'),

  -- ═══════════════════════════════════════════════════════════════════════════
  -- INSURANCE
  -- ═══════════════════════════════════════════════════════════════════════════
  ('insurance', '🛡️', 'Term insurance premiums at 20-year lows for under-35s', 
   'Buying early locks in lower premiums for life. A ₹1 Cr cover costs just ₹500/month at age 25. Protect your family with adequate coverage.', 
   'IMPORTANT', '₹500/month', 'IRDAI Data', true, NULL, 'admin'),
  
  ('insurance', '❤️', 'Health insurance: ₹5L family floater from ₹12,000/year', 
   'Medical inflation is 15% annually. A single hospitalization can wipe out savings. Cashless claims at 10,000+ network hospitals with our partners.', 
   'REGULAR', '₹12,000/year', 'BM Wealth', true, NULL, 'admin'),

  ('insurance', '👨‍👩‍👧‍👦', 'Super top-up: Affordable way to increase health coverage', 
   'Already have ₹5L cover? Add ₹25L super top-up for just ₹3,000/year. Activates after base policy exhausts. Smart way to handle major medical expenses.', 
   'EDUCATIONAL', '₹3,000/year', 'BM Wealth', true, NULL, 'admin'),

  -- ═══════════════════════════════════════════════════════════════════════════
  -- PORTFOLIO MANAGEMENT
  -- ═══════════════════════════════════════════════════════════════════════════
  ('portfolio', '🎯', 'Get FREE personalized portfolio review from our experts', 
   'Annual portfolio reviews help rebalance and optimize. Our SEBI-registered advisors analyze your goals, risk profile, and current investments.', 
   'EDUCATIONAL', 'Free review', 'BM Wealth', true, NULL, 'admin'),
  
  ('portfolio', '📊', 'Diversified portfolios outperformed single-stock bets by 25%', 
   'Spreading investments across assets reduces risk. Asset allocation is the key to long-term wealth building. Let us help you diversify.', 
   'REGULAR', '+25% performance', 'BM Wealth Research', true, NULL, 'admin'),

  ('portfolio', '⚖️', 'Rebalancing: The secret to maintaining your risk profile', 
   'Markets move your allocation away from targets. Annual rebalancing ensures you stay aligned with your goals. Book a review session today.', 
   'EDUCATIONAL', 'Annual review', 'BM Wealth', true, NULL, 'admin'),

  -- ═══════════════════════════════════════════════════════════════════════════
  -- TRADING SERVICES
  -- ═══════════════════════════════════════════════════════════════════════════
  ('trading', '⚡', 'Open a trading account in 15 minutes with BM Wealth', 
   'Paperless account opening with instant activation. Trade in stocks, F&O, commodities, and currency. Zero account opening charges.', 
   'REGULAR', '15 min activation', 'BM Wealth', true, NULL, 'admin'),
  
  ('trading', '📉', 'Brokerage as low as ₹10/trade for delivery orders', 
   'Low-cost trading helps maximize your returns. No hidden charges, transparent pricing. Intraday at 0.03% or ₹20 per order.', 
   'EDUCATIONAL', '₹10/trade', 'BM Wealth', true, NULL, 'admin'),

  -- ═══════════════════════════════════════════════════════════════════════════
  -- TAX PLANNING
  -- ═══════════════════════════════════════════════════════════════════════════
  ('tax_insight', '📋', 'ELSS funds: Save up to ₹46,800 in taxes under 80C', 
   'ELSS has shortest lock-in (3 years) among 80C options. Potential for higher returns than PPF/FD. Invest by March 31 to claim this FY deduction.', 
   'IMPORTANT', '₹46,800 savings', 'Income Tax Dept', true, NULL, 'admin'),

  ('tax_insight', '💡', 'New vs Old tax regime: Which saves you more?', 
   'New regime has lower rates but no deductions. Old regime better if you have home loan, 80C investments. Use our calculator to compare.', 
   'EDUCATIONAL', 'Compare regimes', 'BM Wealth', true, NULL, 'admin'),

  -- ═══════════════════════════════════════════════════════════════════════════
  -- NPS (National Pension System)
  -- ═══════════════════════════════════════════════════════════════════════════
  ('nps', '🏆', 'NPS: Extra ₹50,000 deduction under 80CCD(1B)', 
   'Total 80C + 80CCD deduction can reach ₹2 lakh. NPS offers lowest-cost retirement planning with equity exposure for growth.', 
   'EDUCATIONAL', '₹50,000 extra', 'PFRDA', true, NULL, 'admin'),

  -- ═══════════════════════════════════════════════════════════════════════════
  -- GOLD INVESTMENT
  -- ═══════════════════════════════════════════════════════════════════════════
  ('forex_gold', '💎', 'Sovereign Gold Bonds: Earn 2.5% interest on gold investment', 
   'SGBs give gold returns + 2.5% annual interest. No making charges, no storage worries. Tax-free gains if held to maturity.', 
   'REGULAR', '2.5% interest', 'RBI', true, NULL, 'admin'),

  ('forex_gold', '🥇', 'Gold allocation: 5-10% recommended in every portfolio', 
   'Gold acts as hedge against inflation and currency depreciation. Diversifies portfolio during equity market corrections.', 
   'EDUCATIONAL', '5-10% allocation', 'BM Wealth Research', true, NULL, 'admin'),

  -- ═══════════════════════════════════════════════════════════════════════════
  -- IPO
  -- ═══════════════════════════════════════════════════════════════════════════
  ('ipo', '🚀', 'Apply for IPOs through BM Wealth - Seamless UPI process', 
   'Get IPO alerts, analysis, and one-click application. UPI mandate makes payment easy. Check grey market premium before applying.', 
   'REGULAR', 'Easy apply', 'BM Wealth', true, NULL, 'admin'),

  -- ═══════════════════════════════════════════════════════════════════════════
  -- MARKET UPDATES (General)
  -- ═══════════════════════════════════════════════════════════════════════════
  ('market_update', '📈', 'Markets tracking: Live Nifty & Sensex updates on BM Wealth', 
   'Stay updated with real-time market data, FII/DII activity, and sector performance. Make informed decisions with our research insights.', 
   'REGULAR', 'Live data', 'BM Wealth', true, NULL, 'admin'),

  -- ═══════════════════════════════════════════════════════════════════════════
  -- RBI / POLICY
  -- ═══════════════════════════════════════════════════════════════════════════
  ('rbi', '🏛️', 'RBI MPC meetings impact your investments - Stay informed', 
   'Repo rate changes affect home loans, FDs, and bond prices. We send alerts before every MPC meeting with expert analysis.', 
   'EDUCATIONAL', 'MPC alerts', 'BM Wealth', true, NULL, 'admin');


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════
-- Check how many headlines were added
SELECT 
  'Total headlines' as metric, 
  COUNT(*) as count 
FROM live_intelligence_headlines
UNION ALL
SELECT 
  'Service headlines (no expiry)' as metric, 
  COUNT(*) as count 
FROM live_intelligence_headlines 
WHERE valid_until IS NULL AND created_by = 'admin';
