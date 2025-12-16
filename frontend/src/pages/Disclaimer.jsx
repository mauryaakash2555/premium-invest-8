import React from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle } from 'lucide-react';

const Disclaimer = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Disclaimer - BM Wealth</title>
        <meta name="description" content="Important disclaimers and risk disclosures for BM Wealth services" />
      </Helmet>
      
      <div style={{ minHeight: '100vh', background: '#000000', paddingTop: '120px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 6vw, 48px)',
            fontWeight: '700',
            color: '#DAA520',
            marginBottom: '12px',
            lineHeight: '1.2'
          }}>Disclaimer</h1>
          <p style={{ fontSize: '16px', color: '#999', marginBottom: '40px' }}>Last Updated: December 8, 2025</p>
          
          <div>
            {/* Important Warning */}
            <div style={{
              background: 'rgba(218, 165, 32, 0.1)',
              borderLeft: '4px solid #DAA520',
              padding: '24px',
              marginBottom: '40px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(218, 165, 32, 0.3)'
            }}>
              <AlertTriangle style={{ color: '#DAA520', flexShrink: 0, marginTop: '4px' }} size={24} />
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#DAA520',
                  marginBottom: '12px'
                }}>Investment Risk Warning</h2>
                <p style={{
                  fontSize: '16px',
                  color: '#E5E5E5',
                  fontWeight: '600',
                  marginBottom: '12px',
                  lineHeight: '1.6'
                }}>
                  MUTUAL FUND INVESTMENTS ARE SUBJECT TO MARKET RISKS. READ ALL SCHEME-RELATED 
                  DOCUMENTS CAREFULLY BEFORE INVESTING.
                </p>
                <p style={{
                  fontSize: '16px',
                  color: '#B8B8B8',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Past performance is not indicative of future returns. The value of investments 
                  and the income from them can go down as well as up, and you may not get back 
                  the amount you invested.
                </p>
              </div>
            </div>

            {/* Investment Disclaimer */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>1. Investment Disclaimer</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                The information, analysis, and recommendations provided by BM Wealth are for 
                informational and educational purposes only. They should not be construed as 
                investment advice or a recommendation to buy, sell, or hold any securities or 
                financial products.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                All investment decisions are solely your responsibility. You should conduct your 
                own research and consult with independent financial advisors before making any 
                investment decisions.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                <strong style={{ color: '#E5E5E5' }}>Important:</strong> Mutual fund investments are subject to market risks. 
                Past performance is not indicative of future returns. Please read all scheme-related 
                documents carefully before investing.
              </p>
            </section>

            {/* Market Risks */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>2. Market Risks</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                Investments in financial markets carry inherent risks, including but not limited to:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Market Risk:</strong> Fluctuations in stock prices, interest rates, and overall market conditions
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Credit Risk:</strong> Risk of default by issuers of debt securities
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Liquidity Risk:</strong> Difficulty in selling investments at fair prices
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Currency Risk:</strong> For international investments, exchange rate fluctuations
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Inflation Risk:</strong> Erosion of purchasing power over time
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Political Risk:</strong> Changes in government policies and regulations
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>
                  <strong style={{ color: '#E5E5E5' }}>Concentration Risk:</strong> Over-exposure to particular sectors or asset classes
                </li>
              </ul>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                The value of your investments can go up or down, and you may receive less than your 
                original investment when you redeem your units.
              </p>
            </section>

            {/* Not Financial Advice */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>3. Not Financial Advice</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                BM Wealth provides general guidance and information about financial products and 
                investment opportunities. This information is NOT personalized financial advice 
                tailored to your specific circumstances unless explicitly stated in a formal 
                advisory agreement.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                We make no warranties or guarantees about the accuracy, completeness, or timeliness 
                of the information provided. Market conditions change rapidly, and information that 
                was accurate at the time of publication may become outdated.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                The content on our website, blog posts, videos, and other communications are for 
                general informational purposes only and should not be considered as professional 
                financial advice.
              </p>
            </section>

            {/* Professional Consultation Required */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>4. Professional Consultation Required</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                Every individual's financial situation is unique. Before making any investment 
                decisions, you should:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: 0, color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Assess your own financial situation, investment goals, and risk tolerance</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Consult with qualified financial, legal, and tax advisors</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Read all product-related documents and disclosures carefully</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Understand the terms, conditions, and risks associated with any investment</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>Consider your investment time horizon and liquidity needs</li>
              </ul>
            </section>

            {/* Insurance Products Disclaimer */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>5. Insurance Products Disclaimer</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                Insurance products are regulated by the Insurance Regulatory and Development Authority 
                of India (IRDAI). BM Wealth is an IRDAI Licensed Insurance Advisor (License Number: 277925).
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                Key points regarding insurance products:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Insurance is a subject matter of solicitation</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Policy benefits depend on the terms and conditions of the specific policy</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Premium amounts may vary based on age, health, and other factors</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Claims are subject to policy terms and underwriting guidelines</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>Tax benefits are subject to changes in tax laws</li>
              </ul>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                Please read the policy documents carefully before purchasing any insurance product.
              </p>
            </section>

            {/* Regulatory Status */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>6. Regulatory Status</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                BM Wealth operates under the following regulatory framework:
              </p>
              <div style={{
                background: 'rgba(218, 165, 32, 0.05)',
                padding: '24px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid rgba(218, 165, 32, 0.2)'
              }}>
                <ul style={{ listStyleType: 'disc', paddingLeft: '24px', margin: 0, color: '#B8B8B8' }}>
                  <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                    <strong style={{ color: '#E5E5E5' }}>IRDAI Licensed Insurance Advisor:</strong> License Number 277925
                    <br />
                    <span style={{ fontSize: '14px' }}>We are authorized to provide insurance advisory services</span>
                  </li>
                  <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>
                    <strong style={{ color: '#E5E5E5' }}>AMFI Registered Mutual Fund Distributor:</strong> ARN 90008
                    <br />
                    <span style={{ fontSize: '14px' }}>We are authorized to distribute mutual fund products</span>
                  </li>
                </ul>
              </div>
              <p style={{ fontSize: '16px', color: '#DAA520', lineHeight: '1.8', fontWeight: '600', marginBottom: '20px' }}>
                IMPORTANT: We are NOT SEBI-registered investment advisors.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                We follow SEBI guidelines and regulations applicable to mutual fund distributors, 
                but we are not registered as investment advisors under SEBI's Investment Advisers 
                Regulations, 2013.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>7. Limitation of Liability</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                BM Wealth, its proprietor, employees, and associates shall not be held liable for:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Any financial losses resulting from investments made based on our recommendations</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Losses due to market volatility or economic conditions</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Errors, omissions, or inaccuracies in information provided</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Delays in updating information or responding to inquiries</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>Technical issues affecting access to our services or website</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>Third-party actions, including but not limited to mutual fund companies and insurance providers</li>
              </ul>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                Your use of our services is at your own risk. We recommend diversification and 
                prudent investment practices to manage risk.
              </p>
            </section>

            {/* Contact Information */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>8. Contact Us</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                For any questions or clarifications regarding this disclaimer:
              </p>
              <div style={{
                background: 'rgba(218, 165, 32, 0.05)',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid rgba(218, 165, 32, 0.2)'
              }}>
                <p style={{ fontSize: '16px', color: '#E5E5E5', marginBottom: '12px' }}><strong>BM Wealth</strong></p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>Proprietor: Brahmdeo Maurya</p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>Phone: +91 8850977259</p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>Email: support@bmwealth.co.in</p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', margin: 0 }}>
                  Address: 66, Vinod Villa Bldg., 1st floor office no. 108, Cavel Cross Lane 3, Kalbadevi, Mumbai - 400002, Maharashtra, India
                </p>
              </div>
            </section>

            {/* License Information */}
            <section style={{
              background: 'rgba(218, 165, 32, 0.05)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid rgba(218, 165, 32, 0.3)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '16px'
              }}>Regulatory Licenses</h3>
              <p style={{ fontSize: '14px', color: '#B8B8B8', marginBottom: '8px' }}>
                <strong style={{ color: '#E5E5E5' }}>IRDAI License Number:</strong> 277925
              </p>
              <p style={{ fontSize: '14px', color: '#B8B8B8', marginBottom: '16px' }}>
                <strong style={{ color: '#E5E5E5' }}>AMFI Registration:</strong> ARN 90008
              </p>
              <p style={{ fontSize: '14px', color: '#B8B8B8', margin: 0 }}>
                <strong style={{ color: '#E5E5E5' }}>Office Address:</strong><br />
                66, Vinod Villa Bldg., 1st floor office no. 108, Cavel Cross Lane 3, Kalbadevi, Mumbai - 400002, Maharashtra, India
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Disclaimer;
