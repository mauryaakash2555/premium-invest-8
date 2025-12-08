import React from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const TermsAndConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Terms and Conditions - BM Wealth</title>
        <meta name="description" content="Terms and Conditions for BM Wealth financial advisory services" />
      </Helmet>
      
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-gray-500 mb-8">Last Updated: December 8, 2025</p>
          
          <div className="prose prose-lg max-w-none">
            {/* Acceptance of Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using the services provided by BM Wealth, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms and Conditions. If you do not agree with any 
                part of these terms, please refrain from using our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These terms constitute a legally binding agreement between you and BM Wealth, owned and operated 
                by Brahmdeo Maurya.
              </p>
            </section>

            {/* Services Provided */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Services Provided</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                BM Wealth provides financial advisory services including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Mutual fund distribution services as an AMFI Registered Distributor (ARN 90008)</li>
                <li>Insurance advisory services as an IRDAI Licensed Advisor (License Number: 277925)</li>
                <li>Portfolio management guidance</li>
                <li>Investment planning and advisory</li>
                <li>Financial planning consultations</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We are IRDAI Licensed and AMFI Registered. We follow SEBI guidelines but are NOT SEBI-registered 
                investment advisors.
              </p>
            </section>

            {/* No Investment Advice Guarantee */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. No Investment Advice Guarantee</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                While we strive to provide accurate and helpful financial guidance, the information and advice 
                provided by BM Wealth are for informational purposes only and should not be construed as a 
                guarantee of investment returns or financial outcomes.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                All investment decisions made by you are at your own risk. Mutual fund investments are subject 
                to market risks. Past performance is not indicative of future returns. Please read all 
                scheme-related documents carefully before investing.
              </p>
            </section>

            {/* User Responsibilities */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                As a user of BM Wealth services, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Provide accurate and complete information when requested</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Conduct your own due diligence before making investment decisions</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use our services for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To the fullest extent permitted by law, BM Wealth, its proprietor, and its representatives 
                shall not be liable for any direct, indirect, incidental, consequential, or punitive damages 
                arising from:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Your use or inability to use our services</li>
                <li>Investment losses or financial damages</li>
                <li>Errors or omissions in the information provided</li>
                <li>Unauthorized access to or alteration of your data</li>
                <li>Market fluctuations or economic conditions</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Our total liability to you for any claim arising out of or relating to these terms or our 
                services shall not exceed the amount of fees paid by you to us in the six months preceding 
                the claim.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on the BM Wealth website and in our communications, including but not limited to 
                text, graphics, logos, images, and software, is the property of BM Wealth and is protected 
                by copyright and other intellectual property laws.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may not reproduce, distribute, modify, or create derivative works from any content without 
                our express written permission.
              </p>
            </section>

            {/* Privacy and Data Protection */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is important to us. Our collection, use, and protection of your personal 
                information are governed by our Privacy Policy, which is incorporated into these Terms and 
                Conditions by reference.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our services, you consent to the collection and use of your information as described 
                in our Privacy Policy. We do NOT sell your personal data to third parties.
              </p>
            </section>

            {/* Service Modifications */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Service Modifications</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                BM Wealth reserves the right to modify, suspend, or discontinue any aspect of our services 
                at any time without prior notice. We may also update these Terms and Conditions periodically.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Your continued use of our services after any changes constitutes your acceptance of the 
                revised terms.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Either party may terminate this agreement at any time. You may discontinue using our services 
                at any time. We reserve the right to terminate or suspend your access to our services if you 
                violate these Terms and Conditions.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Upon termination, your right to use our services will immediately cease, but the provisions 
                regarding limitation of liability, intellectual property, and governing law shall survive.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Governing Law and Jurisdiction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms and Conditions shall be governed by and construed in accordance with the laws 
                of India. Any disputes arising from or relating to these terms shall be subject to the 
                exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions or concerns about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-700 mb-2"><strong>BM Wealth</strong></p>
                <p className="text-gray-700 mb-2">Proprietor: Brahmdeo Maurya</p>
                <p className="text-gray-700 mb-2">
                  Address: 66, Vinod Villa Bldg., 1st floor office no. 108,<br />
                  Cavel Cross Lane 3, Kalbadevi, Mumbai - 400002, Maharashtra, India
                </p>
                <p className="text-gray-700 mb-2">Phone: +91 8850977259</p>
                <p className="text-gray-700">Email: support@bmwealth.co.in</p>
              </div>
            </section>

            {/* License Information */}
            <section className="mb-8 bg-gray-50 p-6 rounded">
              <h3 className="text-xl font-semibold mb-4">Regulatory Information</h3>
              <p className="text-sm text-gray-600 mb-2">
                <strong>IRDAI License Number:</strong> 277925
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>AMFI Registration:</strong> ARN 90008
              </p>
              <p className="text-sm text-gray-600">
                We are AMFI Registered and IRDAI Licensed. We are NOT SEBI-registered investment advisors.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
