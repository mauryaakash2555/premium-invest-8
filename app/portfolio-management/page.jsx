/**
 * FILE: app\portfolio-management\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
 * - next/link
 * - lucide-react
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Shield, PieChart, Phone, Mail } from 'lucide-react';
import RiskWarning from '@/components/shared/RiskWarning';

const PortfolioManagement = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff' }}>
      

      {/* Hero */}
      <section style={{
        position: 'relative',
        backgroundColor: '#000000',
        padding: '120px 0 80px 0',
        textAlign: 'center',
        marginTop: '80px',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)'
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '52px',
            fontWeight: '700',
            color: '#DAA520',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            Professional Portfolio Curation Services Mumbai
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#e5e5e5',
            maxWidth: '800px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            Comprehensive wealth architecture solutions for high net worth individuals and families
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        <RiskWarning type="pms" />

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Comprehensive Wealth Architecture Solutions
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Portfolio curation is the art and science of making investment decisions to achieve specific financial objectives while managing risk appropriately. At BM Wealth, our portfolio curation services go beyond simple product selection – we create holistic wealth architecture strategies tailored to each client's unique financial situation, goals, risk tolerance, and life stage. Our AMFI registered wealth architects (ARN 90008) bring decades of combined experience serving Mumbai's affluent investors, from young professionals building their first crore to seasoned business owners managing multi-crore portfolios.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Mumbai, as India's financial capital, hosts some of the country's wealthiest individuals and families. The city's unique ecosystem – thriving startup culture, established business houses, multinational corporations, and real estate wealth – creates complex portfolio management needs. Our clients range from corporate executives with substantial ESOPs to entrepreneurs who've exited businesses, from legacy wealth families to first-generation wealth creators. Each requires a customized approach balancing growth, income, tax efficiency, and capital preservation.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Our portfolio curation philosophy rests on several core principles: disciplined asset allocation based on scientific research and individual circumstances, regular rebalancing to maintain target allocations, tax-efficient investing to maximize post-tax returns, behavioral coaching to prevent emotional decision-making, and transparent communication ensuring clients understand their portfolios completely. We believe successful investing is a marathon, not a sprint, and our long-term relationships with clients reflect this philosophy.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Portfolio Construction Methodology
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Our portfolio construction process follows a systematic, repeatable methodology ensuring consistency and objectivity. The journey begins with comprehensive wealth strategies – understanding your complete financial picture including income, expenses, assets, liabilities, insurance coverage, and existing investments. For Mumbai clients, this often involves evaluating substantial real estate holdings, family business interests, or offshore investments alongside traditional financial assets.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Goal identification forms the cornerstone of portfolio design. We work with clients to articulate and prioritize financial objectives: retirement planning (typical Mumbai retirement corpus requirements range from ₹15-20 crores depending on lifestyle expectations), children's education (international education costs now exceed ₹1 crore per child), wedding expenses, home purchases, philanthropy, wealth transfer, or simply wealth accumulation. Each goal is assigned a timeframe, target amount, and priority level, forming the foundation for asset allocation decisions.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Risk profiling goes beyond simple questionnaires. We conduct detailed discussions exploring your investment experience, emotional responses to market volatility, financial obligations, income stability, and capacity to bear losses. A Mumbai entrepreneur with multiple income streams can afford more risk than a salaried executive solely dependent on one income source, even if both have similar net worth. Our proprietary risk scoring system considers both willingness (psychological comfort) and ability (financial capacity) to bear risk, ensuring appropriate portfolio alignment.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Asset allocation – determining the mix of equities, debt, gold, real estate, and alternative investments – is perhaps the most critical portfolio decision, explaining 80-90% of portfolio returns according to academic research. Our allocations are science-based, using mean-variance optimization, Monte Carlo simulations, and historical return analysis while incorporating forward-looking market views. A typical balanced portfolio for a 40-year-old Mumbai professional might comprise 60% equity (diversified across large, mid, and small caps, domestic and international), 30% debt (mix of duration and credit strategies), 5% gold (inflation hedge and portfolio stabilizer), and 5% alternatives or cash. This allocation is customized based on individual circumstances.
          </p>
        </section>

        <div style={{
          background: 'linear-gradient(135deg, #DAA520 0%, #8B6914 100%)',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h3 style={{ fontSize: '28px', color: '#000', marginBottom: '16px', fontWeight: '600' }}>
            Ready to Optimize Your Investment Portfolio?
          </h3>
          <p style={{ fontSize: '17px', color: '#000', marginBottom: '24px' }}>
            Schedule a comprehensive portfolio review with our experienced wealth architects
          </p>
          <a href="tel:+918850977259" style={{
            backgroundColor: '#000',
            color: '#DAA520',
            padding: '14px 32px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px',
            display: 'inline-block'
          }}>
            Call +91 8850977259
          </a>
        </div>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Asset Allocation Strategies
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Asset allocation evolves throughout your investment lifecycle, adapting to changing circumstances, goals, and market conditions. A well-constructed allocation balances several competing objectives: growth vs. stability, income vs. capital appreciation, liquidity vs. illiquidity premium, tax efficiency vs. gross returns, and domestic vs. international exposure. For young professionals (25-35 years) with long horizons, a common approach is higher equity exposure (often in the 80-90% range), depending on goals and risk tolerance. Such portfolios may emphasize growth-oriented assets – equity mutual funds, direct equity positions, international equity exposure, and potentially early-stage investments or ESOPs.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Mid-career professionals (35-50 years) often have multiple competing goals – children's education approaching, retirement planning beginning, potential home upgrades, elderly parent care. Portfolios often transition toward more balanced allocations (commonly around 60-70% equity), incorporating more stable debt instruments for near-term goals while maintaining equity exposure for long-term objectives. Senior professionals and pre-retirees (50-60 years) may use "glide path" strategies that gradually reduce equity exposure as retirement approaches (for example, moving from ~60% equity around age 50 toward ~30-40% closer to retirement), depending on income stability, spending needs, and risk capacity.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Retirees often need income-focused portfolios balancing capital preservation with inflation protection. Many retiree allocations use a mix such as 30-40% equity (for growth potential), 50-60% debt (for stability and income), and ~10% gold/alternatives (for diversification), adjusted to individual needs and risk tolerance. Laddered debt portfolios can help manage liquidity and interest-rate reinvestment risk. Systematic withdrawal plans (SWPs) from mutual funds can be one approach for income planning, but suitability depends on risk profile, taxes, and cash-flow needs. High net worth individuals with substantial corpus (₹15 crores+) may explore more sophisticated strategies including Portfolio Management Services (PMS), Alternative Investment Funds (AIFs), direct equity portfolios, offshore investing, and structured products through appropriately regulated entities.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Risk Management and Diversification
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Diversification is the only free lunch in investing – reducing portfolio risk without sacrificing expected returns. Our multi-layer diversification approach protects portfolios from various risk sources. Asset class diversification combines equities, debt, gold, and real estate, each behaving differently under various economic scenarios. When equity markets decline, debt and gold often provide stability; when inflation rises, gold and real estate offer protection. This foundational diversification smooths portfolio volatility significantly compared to single-asset portfolios.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Within equity allocation, we diversify across market capitalizations (large, mid, small cap), sectors (IT, banking, pharma, consumer, infrastructure), investment styles (growth vs. value), and geographies (Indian vs. international markets). A diversified equity portfolio might include Nifty 50 index exposure for large cap stability, focused mid cap funds for growth, sector-specific themes capturing specific opportunities, and international funds providing global diversification and dollar exposure. This multi-dimensional approach reduces concentration risk while capturing diverse return sources.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Debt diversification spans duration (short, medium, long term bonds), credit quality (government securities, AAA corporates, AA-rated papers), and instrument types (bonds, debentures, fixed deposits, liquid funds). Rather than concentrating in single instruments like bank fixed deposits, our debt allocations use multiple fund categories providing liquidity, yield optimization, and interest rate risk management. Risk management extends beyond diversification to position sizing, stop losses on direct equity positions, derivatives hedging for large portfolios, insurance against catastrophic losses, emergency fund maintenance, and regular portfolio stress testing. We conduct quarterly portfolio reviews analyzing performance attribution, risk metrics, goal progress, and rebalancing needs. These disciplined reviews ensure portfolios stay aligned with objectives despite market movements or life changes.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Performance Monitoring and Rebalancing
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Portfolio monitoring is continuous, not periodic. Our systems track daily NAVs, performance metrics, fund manager changes, portfolio drift, and market developments. However, we avoid reactive trading based on short-term market movements, instead focusing on strategic position management and disciplined rebalancing. Rebalancing is the process of bringing portfolio allocations back to target levels after market movements cause drift. If your target allocation is 60% equity and 40% debt, strong equity market performance might grow equity to 70% of portfolio value, increasing risk beyond intended levels. Rebalancing sells appreciated equities and buys debt, locking gains and maintaining target risk exposure.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Our rebalancing philosophy balances discipline with flexibility. We typically rebalance when asset class weightings deviate more than 5% from targets (called threshold rebalancing) or at least annually, whichever comes first. This prevents excessive trading while ensuring portfolios don't drift dangerously from intended allocations. Rebalancing also forces a buy-low-sell-high discipline, as we systematically trim winners and add to laggards – counterintuitive but wealth-creating over time. For Mumbai investors, rebalancing opportunities often arise during market extremes like the March 2020 COVID crash or the 2021 bull market peak. Clients who rebalanced during 2020's panic, selling debt to buy battered equities at discounts, enjoyed exceptional subsequent returns as markets recovered.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Fund selection monitoring is equally important. We continuously evaluate mutual funds across parameters: rolling returns analysis, risk-adjusted performance metrics (Sharpe ratio, alpha, beta), consistency across market cycles, fund manager tenure and changes, expense ratio competitiveness, portfolio concentration and turnover, and investment process adherence. Underperforming funds are placed on watchlists, with replacements made after careful evaluation to avoid knee-jerk reactions. Our fund replacement philosophy focuses on persistent underperformance over multiple periods or fundamental changes (fund manager exit, strategy drift, AUM explosion affecting nimbleness) rather than short-term wobbles.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            High Net Worth Individual Solutions
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            High net worth individuals (HNIs) and ultra-high net worth individuals (UHNIs) with substantial portfolios require specialized services beyond standard curation. Our HNI practice serves Mumbai's affluent investors with customized solutions addressing complex wealth architecture needs. HNI portfolios often include direct equity investments in select companies, providing concentrated exposure to high-conviction ideas. We assist with stock research, valuation analysis, entry/exit timing, and position sizing for direct equity allocations. Many Mumbai HNIs maintain 20-30% portfolios in carefully selected direct stocks complementing mutual fund holdings.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Portfolio Management Services (PMS) offer professionally managed, separately managed accounts for HNIs with ₹50 lakh+ investable assets. Unlike mutual funds pooling multiple investors' money, PMS creates individual portfolios tailored to your specifications. We provide access to top-tier regulated distribution partners specializing in various strategies – value investing, growth stocks, momentum strategies, sector-focused approaches, or multi-cap allocations. PMS particularly suits HNIs wanting direct stock ownership, customization around tax situations or ethical preferences, and personalized portfolio curation. Alternative Investment Funds (AIFs) provide access to non-traditional assets – private equity, venture capital, real estate, distressed assets, or hedge fund strategies. Category I AIFs invest in startups and early-stage ventures; Category II includes private equity and debt funds; Category III encompasses hedge funds and complex trading strategies. With minimum investments typically ₹1 crore, AIFs suit UHNIs seeking portfolio diversification beyond traditional equity-debt allocations.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            International diversification provides geographic risk distribution and currency diversification for Mumbai HNIs. Through international mutual funds or direct offshore investing (under LRS scheme allowing $250,000 annual remittance per person), HNIs access global equity markets, developed country bonds, thematic funds, and offshore real estate. This geographic diversification reduces India-specific risks while providing dollar-denominated assets hedging rupee depreciation. Tax planning becomes paramount for HNIs facing highest tax brackets. We coordinate with tax professionals implementing tax-efficient strategies: maximizing 80C deductions through ELSS, utilizing capital gains exemptions (₹1 lakh LTCG exemption annually), tax-loss harvesting to offset gains with losses, location optimization (debt in tax-free bonds vs. taxable funds), and estate planning through trusts or holding companies. Every percentage point saved in taxes compounds significantly for large portfolios.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Mumbai Real Estate vs Financial Markets Analysis
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Mumbai investors face a unique portfolio decision – balancing real estate investments with financial market allocations. The city's legendary real estate market, with South Mumbai properties exceeding ₹1 lakh per square foot and even suburban properties commanding premium valuations, creates both wealth creation opportunities and portfolio concentration risks. Many Mumbai families have 60-80% net worth tied in real estate – owned residence, rental properties, inherited parcels, or speculative holdings. While Mumbai real estate has generated substantial wealth historically, such concentration violates diversification principles and creates liquidity risks. Our analysis shows balanced portfolios combining financial assets and real estate optimize risk-adjusted returns better than over-concentration in either asset class.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Real estate offers tangible asset comfort, potential rental income (Mumbai yields 2-3% typically), inflation protection, and generational wealth transfer advantages. However, it suffers from high transaction costs (stamp duty, registration, brokerage totaling 8-10% in Maharashtra), illiquidity requiring months to sell, indivisibility making portfolio adjustments difficult, maintenance and management hassles, regulatory and legal risks, and location-specific returns creating concentration. Financial assets counter these disadvantages with high liquidity, low transaction costs, easy divisibility, professional management, regulatory protection, and broad diversification. Our recommendation for Mumbai investors: limit real estate to 40-50% of total net worth maximum, including primary residence. For financial assets, maintain 50-60% allocation spread across equity, debt, and gold. This balanced approach provides real estate benefits while ensuring adequate liquid financial assets for goals, emergencies, and opportunities.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            For Mumbai millennials and Gen Z facing astronomical real estate costs, we advocate building substantial financial asset portfolios first before considering property purchases. A 30-year-old earning ₹15 lakhs annually might face ₹2 crore+ costs for a decent 2BHK apartment in suburbs. Rather than straining finances with massive EMIs, systematic investing of ₹30,000-40,000 monthly over 10-15 years builds significant corpus while maintaining financial flexibility. Once substantial financial assets are accumulated, property purchases can complement rather than dominate portfolios. Many successful Mumbai investors built financial portfolios first, using market appreciation and dividend income to fund property purchases without devastating their overall financial health. This sequencing – financial assets first, real estate strategically later – creates balanced, resilient portfolios for long-term wealth creation.
          </p>
        </section>

        <section style={{
          marginTop: '60px',
          padding: '24px',
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(251, 191, 36, 0.3)'
        }}>
          <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#e5e5e5', marginBottom: '12px' }}>
            <strong>Investment Disclaimer:</strong> Portfolio curation involves market risks. Past performance does not guarantee future results. Asset allocation and diversification do not ensure profits or protect against losses. BM Wealth (AMFI ARN 90008) provides portfolio curation and mutual fund distribution services. We are a registered distribution firm. For PMS, AIF, or sophisticated investment strategies, we provide access to appropriate regulated entities. All portfolio recommendations are made considering individual circumstances, goals, and risk profiles. Consult with our wealth architects for personalized guidance.
          </p>
        </section>

      </div>
    </div>
  );
};

export default PortfolioManagement;
