/**
 * FILE: app\trading-services\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
 * - next/link
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
import RiskWarning from '@/components/shared/RiskWarning';
import FAQSection from '@/components/shared/FAQSection';
const TradingServices = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: 'Do you provide stock tips or guaranteed trading returns?',
      answer:
        'No. Trading involves significant risk and returns are not guaranteed. We focus on education, platform selection support, and risk-awareness guidance rather than promises or guarantees.',
    },
    {
      question: 'What is required to open a demat account?',
      answer:
        'Typically PAN, Aadhaar, bank account details, and a photo. Some segments (like derivatives) may require income proof depending on the broker.',
    },
    {
      question: 'Is intraday trading suitable for beginners?',
      answer:
        'Intraday trading can be high risk. Many beginners start with learning, paper trading, and small position sizes before risking meaningful capital.',
    },
    {
      question: 'Are the platform links affiliate links?',
      answer:
        'Some platform links may be affiliate links. If you sign up through them, we may earn a commission at no extra cost to you.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff' }}>

      <script
        id="trading-services-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      

      <section style={{
        position: 'relative',
        backgroundColor: '#000000',
        padding: '120px 0 80px 0',
        textAlign: 'center',
        marginTop: '80px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '52px',
            fontWeight: '700',
            color: '#DAA520',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            Stock Trading and Demat Services Mumbai
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#e5e5e5',
            maxWidth: '800px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            Comprehensive trading solutions for equity investors and active traders
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        <RiskWarning type="trading" />

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Comprehensive Trading Solutions
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Stock trading requires the right combination of knowledge, tools, discipline, and market access. At BM Wealth, we provide Mumbai investors with comprehensive trading solutions spanning account opening, platform selection, trading advisory, research support, and risk management guidance. Whether you're a long-term investor building a direct equity portfolio or an active trader seeking to capitalize on market movements, our services cater to diverse trading styles and experience levels. Trading in Indian equity markets offers significant wealth creation potential. The BSE Sensex has delivered approximately 15% annual returns over the past two decades, with individual stocks offering even higher returns for informed investors. However, trading also involves substantial risks – approximately 90% of retail traders lose money primarily due to lack of knowledge, emotional trading, inadequate risk management, and poor strategy execution. Our goal is equipping Mumbai investors with knowledge, tools, and guidance to tilt odds in their favor.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Mumbai, hosting the BSE and NSE stock exchanges, has deep-rooted equity market culture. From Dalal Street's legendary traders to modern algo-trading firms in BKC, the city breathes markets. This creates both advantages and challenges for retail investors. Advantages include easy access to market information, vibrant trading community, numerous educational resources, and cultural familiarity with equity investing. Challenges include information overload, tip culture creating noise, emotional contagion during market extremes, and tendency toward excessive trading destroying returns. Our approach emphasizes disciplined, research-based investing over speculative gambling. We advocate measured position sizing, strict risk management, continuous learning, emotional control, and long-term thinking even for active traders. The goal isn't getting rich overnight but building sustainable trading competence creating consistent returns over years.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Demat Account Opening Process
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            A Demat (Dematerialized) account is mandatory for trading stocks, bonds, ETFs, and other securities in Indian markets. Think of it as a digital locker storing your securities electronically instead of physical certificates. Opening a demat account is the essential first step for equity investing in India. The process has become largely digital, with most accounts opened entirely online within 24-48 hours. We assist Mumbai investors with broker selection, comparing factors like brokerage charges (discount brokers like Zerodha/Upstox charge ₹20 per trade vs traditional brokers charging 0.3-0.5% of transaction value), account maintenance charges (₹300-500 annually), trading platform quality, research support availability, customer service quality, and additional features like IPO applications, mutual fund platforms, or US stock trading. Documents required include PAN card (mandatory), Aadhaar card (for e-KYC), bank account proof (cancelled cheque/statement), and recent photograph. Income proof is required for derivatives trading segment activation.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            The e-KYC process using Aadhaar OTP authentication has simplified account opening dramatically. You visit broker's website or app, provide PAN and Aadhaar details, authenticate via OTP, digitally sign application using Aadhaar-based e-sign, and complete video verification (IPVV) for identity confirmation. Most brokers activate accounts within 24 hours, issuing demat account number (BO ID), trading account credentials, and UPI ID for fund transfers. Many active traders keep accounts with two brokers – one primary for regular trading and one backup to maintain market access during technical issues or broker-specific problems. Many Mumbai traders maintain accounts with both discount brokers (for cost efficiency) and full-service brokers (for research and advisory). For beginners, it can be sensible to start with discount brokers' user-friendly platforms and low account minimums, transitioning to full-service brokers later if advisory needs develop.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Equity Trading Strategies
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Successful equity trading requires clear strategy aligned with your objectives, risk tolerance, time availability, and capital size. We help Mumbai investors develop appropriate trading approaches across the spectrum from long-term investing to active trading. Long-term investing (1+ years) focuses on fundamentally sound companies bought at reasonable valuations and held for extended periods to benefit from business growth and compounding. This Warren Buffett-style approach requires patience, research capability, and conviction to hold through volatility. Mumbai investors successfully following this approach build concentrated portfolios of 15-20 carefully selected stocks across sectors, holding for 3-10 years. Examples include investing in strong franchises like HDFC Bank, Asian Paints, or Bajaj Finance during temporary setbacks, then benefiting from long-term business growth. This strategy minimizes transaction costs, optimizes tax efficiency (long-term capital gains treatment), and allows full benefit of compounding. Swing trading (days to weeks) capitalizes on short to medium-term price movements driven by earnings announcements, sector trends, or technical patterns. Swing traders combine technical analysis (chart patterns, indicators) with fundamental awareness (earnings, management quality) to identify trading opportunities. Typical holding periods range from 3-4 days to 3-4 weeks, with 3-8% target returns per trade. This approach suits working professionals in Mumbai who can't monitor markets continuously but can dedicate 30-60 minutes daily for analysis and trade management.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Day trading involves opening and closing positions within the same trading session, never holding overnight. This high-intensity approach requires full-time attention, real-time market access, sophisticated tools, and substantial experience. Day traders use technical analysis, price action patterns, order flow, and momentum indicators to identify intraday trading opportunities. While potentially rewarding, day trading has extremely high failure rates and isn't recommended for beginners or those with limited capital. Options trading provides leveraged exposure to stock movements without requiring full share prices. A Nifty option might cost ₹5,000-10,000 while controlling exposure equivalent to buying Nifty at ₹18,000-19,000 levels. This leverage amplifies both gains and losses dramatically. Options strategies range from simple directional bets (buying calls/puts) to complex spreads managing risk (bull call spreads, iron condors, butterfly spreads). Options trading requires extensive knowledge of Greeks (delta, theta, vega), implied volatility, time decay, and position management. We provide educational resources but strongly recommend paper trading (simulated trading) for 6-12 months before trading real capital in options.
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', color: '#DAA520', marginBottom: '24px', fontWeight: '600', fontFamily: '"Playfair Display", serif' }}>
            Risk Management in Trading
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Risk management separates successful traders from the majority who lose money. The fundamental rule: never risk more than you can afford to lose. Many Mumbai traders follow these critical risk principles: Position sizing limits individual position risk to 2-5% of trading capital maximum. If you have ₹5 lakh trading capital, no single position should risk more than ₹10,000-25,000. This ensures even a string of losses doesn't devastate your account, keeping you in the game long enough to benefit from winning trades. Stop losses are mandatory for every trade – predefined prices where you'll exit losing positions regardless of hope or emotion. A typical swing trade might use 5-7% stop loss, meaning if stock declines 5-7% from entry, you exit automatically. This disciplines you to cut losses quickly rather than holding and hoping as losses balloon. Risk-reward ratios should favor reward – aim for at least 1:2 or 1:3 risk-reward, meaning if you risk ₹10,000 on a trade, target at least ₹20,000-30,000 profit. This mathematics means you can be right only 40-50% of the time yet still profit overall.
          </p>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#e5e5e5', marginBottom: '20px', textAlign: 'justify' }}>
            Leverage management is critical – using margin or derivatives multiplies both gains and losses. A 2x leveraged position in a stock declining 10% creates 20% account loss. Many traders blown up weren't wrong on market direction but used excessive leverage turning small moves into catastrophic losses. A conservative approach is to use minimal leverage until you've proven consistent profitability for 12+ months, and even then, avoid exceeding 2x leverage. Diversification applies to trading too – don't concentrate positions in single sector or correlated stocks. If you hold 5 positions all in banking or real estate, sector-specific bad news hits all positions simultaneously. Spread positions across 4-6 uncorrelated sectors. Emotional control might be most important – fear and greed destroy more trading accounts than lack of knowledge. Trading triggers powerful emotions; winning streaks create overconfidence leading to excessive risk-taking, while losing streaks create fear paralyzing decision-making or revenge trading trying to recover losses quickly. Maintaining trading journal documenting every trade – entry reason, exit reason, emotions felt, lessons learned – builds self-awareness and discipline over time.
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
            <strong>Trading Risk Disclaimer:</strong> Stock trading and derivatives involve substantial risk of loss. Past performance is not indicative of future results. Leverage amplifies both gains and losses. Most retail traders lose money. Trade only with capital you can afford to lose completely. BM Wealth provides educational guidance and broker facilitation but does not guarantee trading profits or provide specific buy/sell recommendations. All trading decisions remain your responsibility. SEBI regulations require understanding risks before trading. Consider consulting SEBI-registered advisors for personalized trading guidance.
          </p>
        </section>

        {/* Platform Recommendations Section */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.08) 0%, rgba(184, 134, 11, 0.08) 100%)',
          border: '1px solid rgba(218, 165, 32, 0.3)',
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '40px'
        }}>
          <h2 style={{ 
            fontSize: '36px', 
            color: '#DAA520', 
            marginBottom: '20px', 
            fontWeight: '600', 
            fontFamily: '"Playfair Display", serif',
            textAlign: 'center'
          }}>
            Open Your Trading & Demat Account
          </h2>
          <p style={{ 
            fontSize: '17px', 
            lineHeight: '1.8', 
            color: '#e5e5e5', 
            marginBottom: '32px', 
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 32px'
          }}>
            These SEBI-registered brokers offer seamless trading experience with low costs and robust platforms. 
            Choose based on your trading style and preferences.
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={{ 
              background: 'rgba(0,0,0,0.4)', 
              padding: '28px', 
              borderRadius: '8px',
              border: '1px solid rgba(218, 165, 32, 0.2)'
            }}>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px', fontWeight: '600' }}>
                Zerodha
              </h3>
              <p style={{ fontSize: '15px', color: '#B8B8B8', lineHeight: '1.7', marginBottom: '16px' }}>
                India's largest broker. Zero brokerage on equity delivery. Advanced trading tools. 
                Trusted by 1+ crore investors.
              </p>
              <a 
                href="/track/zerodha" 
                target="_blank" 
                rel="sponsored nofollow noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                  color: '#000',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
              >
                Open Zerodha Account →
              </a>
            </div>

            <div style={{ 
              background: 'rgba(0,0,0,0.4)', 
              padding: '28px', 
              borderRadius: '8px',
              border: '1px solid rgba(218, 165, 32, 0.2)'
            }}>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px', fontWeight: '600' }}>
                Groww
              </h3>
              <p style={{ fontSize: '15px', color: '#B8B8B8', lineHeight: '1.7', marginBottom: '16px' }}>
                Simple, beginner-friendly platform. Stocks, F&O, IPOs, mutual funds all in one app. 
                Zero account opening fees.
              </p>
              <a 
                href="/track/groww" 
                target="_blank" 
                rel="sponsored nofollow noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                  color: '#000',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
              >
                Start Trading on Groww →
              </a>
            </div>

            <div style={{ 
              background: 'rgba(0,0,0,0.4)', 
              padding: '28px', 
              borderRadius: '8px',
              border: '1px solid rgba(218, 165, 32, 0.2)'
            }}>
              <h3 style={{ fontSize: '22px', color: '#DAA520', marginBottom: '12px', fontWeight: '600' }}>
                Smallcase
              </h3>
              <p style={{ fontSize: '15px', color: '#B8B8B8', lineHeight: '1.7', marginBottom: '16px' }}>
                Invest in curated equity portfolios. Thematic baskets managed by experts. 
                Perfect for strategic equity investing.
              </p>
              <a 
                href="/track/smallcase" 
                target="_blank" 
                rel="sponsored nofollow noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                  color: '#000',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
              >
                Explore Smallcase →
              </a>
            </div>
          </div>

          <p style={{ 
            fontSize: '13px', 
            color: '#999', 
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            We may earn referral commissions when you open accounts through these links.
          </p>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: '0', textAlign: 'justify' }}>
            Related resources: <Link href="/platforms" style={{ color: '#C0A062', textDecoration: 'underline' }}>Platforms</Link> ·{' '}
            <Link href="/mutual-funds" style={{ color: '#C0A062', textDecoration: 'underline' }}>Mutual Funds</Link> ·{' '}
            <Link href="/contact" style={{ color: '#C0A062', textDecoration: 'underline' }}>Contact</Link>
          </p>
        </section>

        <FAQSection faqs={faqs} />

      </div>
    </div>
  );
};

export default TradingServices;



