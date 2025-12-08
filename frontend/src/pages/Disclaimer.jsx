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
      
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Disclaimer</h1>
          <p className="text-gray-500 mb-8">Last Updated: December 8, 2025</p>
          
          <div className="prose prose-lg max-w-none">
            {/* Important Warning */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8 flex items-start gap-4">
              <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Investment Risk Warning</h2>
                <p className="text-gray-800 font-semibold mb-2">
                  MUTUAL FUND INVESTMENTS ARE SUBJECT TO MARKET RISKS. READ ALL SCHEME-RELATED 
                  DOCUMENTS CAREFULLY BEFORE INVESTING.
                </p>
                <p className="text-gray-700">
                  Past performance is not indicative of future returns. The value of investments 
                  and the income from them can go down as well as up, and you may not get back 
                  the amount you invested.
                </p>
              </div>
            </div>

            {/* Investment Disclaimer */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Investment Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The information, analysis, and recommendations provided by BM Wealth are for 
                informational and educational purposes only. They should not be construed as 
                investment advice or a recommendation to buy, sell, or hold any securities or 
                financial products.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                All investment decisions are solely your responsibility. You should conduct your 
                own research and consult with independent financial advisors before making any 
                investment decisions.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Important:</strong> Mutual fund investments are subject to market risks. 
                Past performance is not indicative of future returns. Please read all scheme-related 
                documents carefully before investing.
              </p>
            </section>

            {/* Market Risks */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Market Risks</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Investments in financial markets carry inherent risks, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Market Risk:</strong> Fluctuations in stock prices, interest rates, and overall market conditions</li>
                <li><strong>Credit Risk:</strong> Risk of default by issuers of debt securities</li>
                <li><strong>Liquidity Risk:</strong> Difficulty in selling investments at fair prices</li>
                <li><strong>Currency Risk:</strong> For international investments, exchange rate fluctuations</li>
                <li><strong>Inflation Risk:</strong> Erosion of purchasing power over time</li>
                <li><strong>Political Risk:</strong> Changes in government policies and regulations</li>
                <li><strong>Concentration Risk:</strong> Over-exposure to particular sectors or asset classes</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                The value of your investments can go up or down, and you may receive less than your 
                original investment when you redeem your units.
              </p>
            </section>

            {/* Not Financial Advice */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Not Financial Advice</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                BM Wealth provides general guidance and information about financial products and 
                investment opportunities. This information is NOT personalized financial advice 
                tailored to your specific circumstances unless explicitly stated in a formal 
                advisory agreement.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We make no warranties or guarantees about the accuracy, completeness, or timeliness 
                of the information provided. Market conditions change rapidly, and information that 
                was accurate at the time of publication may become outdated.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The content on our website, blog posts, videos, and other communications are for 
                general informational purposes only and should not be considered as professional 
                financial advice.
              </p>
            </section>

            {/* Professional Consultation Required */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Professional Consultation Required</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Every individual's financial situation is unique. Before making any investment 
                decisions, you should:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Assess your own financial situation, investment goals, and risk tolerance</li>
                <li>Consult with qualified financial, legal, and tax advisors</li>
                <li>Read all product-related documents and disclosures carefully</li>
                <li>Understand the terms, conditions, and risks associated with any investment</li>
                <li>Consider your investment time horizon and liquidity needs</li>
              </ul>
            </section>

            {/* Insurance Products Disclaimer */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Insurance Products Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Insurance products are regulated by the Insurance Regulatory and Development Authority 
                of India (IRDAI). BM Wealth is an IRDAI Licensed Insurance Advisor (License Number: 277925).
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Key points regarding insurance products:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Insurance is a subject matter of solicitation</li>
                <li>Policy benefits depend on the terms and conditions of the specific policy</li>
                <li>Premium amounts may vary based on age, health, and other factors</li>
                <li>Claims are subject to policy terms and underwriting guidelines</li>
                <li>Tax benefits are subject to changes in tax laws</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Please read the policy documents carefully before purchasing any insurance product.
              </p>
            </section>

            {/* Regulatory Status */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Regulatory Status</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                BM Wealth operates under the following regulatory framework:
              </p>
              <div className="bg-gray-50 p-4 rounded mb-4">
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <strong>IRDAI Licensed Insurance Advisor:</strong> License Number 277925
                    <br />
                    <span className="text-sm">We are authorized to provide insurance advisory services</span>
                  </li>
                  <li>
                    <strong>AMFI Registered Mutual Fund Distributor:</strong> ARN 90008
                    <br />
                    <span className="text-sm">We are authorized to distribute mutual fund products</span>
                  </li>
                </ul>
              </div>
              <p className="text-gray-700 leading-relaxed font-semibold mb-4">
                IMPORTANT: We are NOT SEBI-registered investment advisors.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We follow SEBI guidelines and regulations applicable to mutual fund distributors, 
                but we are not registered as investment advisors under SEBI's Investment Advisers 
                Regulations, 2013.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                BM Wealth, its proprietor, employees, and associates shall not be held liable for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Any financial losses resulting from investments made based on our recommendations</li>
                <li>Losses due to market volatility or economic conditions</li>
                <li>Errors, omissions, or inaccuracies in information provided</li>
                <li>Delays in updating information or responding to inquiries</li>
                <li>Technical issues affecting access to our services or website</li>
                <li>Third-party actions, including but not limited to mutual fund companies and insurance providers</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Your use of our services is at your own risk. We recommend diversification and 
                prudent investment practices to manage risk.
              </p>
            </section>

            {/* Information Accuracy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Information Accuracy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                While we strive to provide accurate and up-to-date information, we make no 
                representations or warranties regarding:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>The accuracy or completeness of market data and analysis</li>
                <li>The current applicability of tax laws and regulations</li>
                <li>The performance of recommended investments</li>
                <li>The availability or terms of financial products</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Information provided is subject to change without notice. We recommend verifying 
                all information from official sources before making decisions.
              </p>
            </section>

            {/* External Links */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. External Links</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our website may contain links to third-party websites, including mutual fund companies, 
                insurance providers, and other financial institutions. These links are provided for 
                convenience only.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                BM Wealth is not responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>The content, accuracy, or practices of external websites</li>
                <li>Privacy policies of third-party sites</li>
                <li>Products or services offered by external parties</li>
                <li>Any transactions conducted through third-party websites</li>
              </ul>
            </section>

            {/* Grievance Redressal */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Grievance Redressal</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any complaints or grievances regarding our services, please contact:
              </p>
              <div className="bg-gray-50 p-4 rounded mb-4">
                <p className="text-gray-700 mb-2"><strong>Grievance Officer</strong></p>
                <p className="text-gray-700 mb-2">BM Wealth</p>
                <p className="text-gray-700 mb-2">Email: grievance@bmwealth.co.in</p>
                <p className="text-gray-700 mb-2">Phone: +91 8850977259</p>
                <p className="text-gray-700">
                  Address: 66, Vinod Villa Bldg., 1st floor office no. 108,<br />
                  Cavel Cross Lane 3, Kalbadevi, Mumbai - 400002, Maharashtra, India
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                We will endeavor to resolve your complaint within 30 days. If you are not satisfied 
                with our resolution, you may escalate to the relevant regulatory authority.
              </p>
            </section>

            {/* Regulatory Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Regulatory Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For issues related to mutual funds or insurance products, you may also contact the 
                respective regulatory authorities:
              </p>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-700 mb-3">
                  <strong>Association of Mutual Funds in India (AMFI)</strong><br />
                  Website: <a href="https://www.amfiindia.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.amfiindia.com</a>
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>Insurance Regulatory and Development Authority of India (IRDAI)</strong><br />
                  Website: <a href="https://www.irdai.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.irdai.gov.in</a>
                </p>
                <p className="text-gray-700">
                  <strong>Securities and Exchange Board of India (SEBI)</strong><br />
                  Website: <a href="https://www.sebi.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.sebi.gov.in</a><br />
                  <span className="text-sm">For mutual fund-related grievances</span>
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For any questions or clarifications regarding this disclaimer:
              </p>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-700 mb-2"><strong>BM Wealth</strong></p>
                <p className="text-gray-700 mb-2">Proprietor: Brahmdeo Maurya</p>
                <p className="text-gray-700 mb-2">Phone: +91 8850977259</p>
                <p className="text-gray-700">Email: support@bmwealth.co.in</p>
              </div>
            </section>

            {/* License Information */}
            <section className="mb-8 bg-gray-50 p-6 rounded">
              <h3 className="text-xl font-semibold mb-4">Regulatory Licenses</h3>
              <p className="text-sm text-gray-600 mb-2">
                <strong>IRDAI License Number:</strong> 277925
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>AMFI Registration:</strong> ARN 90008
              </p>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Office Address:</strong><br />
                66, Vinod Villa Bldg., 1st floor office no. 108,<br />
                Cavel Cross Lane 3, Kalbadevi, Mumbai - 400002, Maharashtra, India
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Disclaimer;
