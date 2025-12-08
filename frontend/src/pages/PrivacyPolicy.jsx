import React from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Privacy Policy - BM Wealth</title>
        <meta name="description" content="Privacy Policy for BM Wealth - How we protect and manage your data" />
      </Helmet>
      
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last Updated: December 8, 2025</p>
          
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                At BM Wealth, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our financial advisory services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our services, you consent to the data practices described in this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide to us, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Name, email address, phone number</li>
                <li>Date of birth, PAN card details, Aadhaar information</li>
                <li>Address and contact details</li>
                <li>Bank account information</li>
                <li>Investment preferences and financial goals</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Financial Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To provide our services effectively, we collect:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Income and employment details</li>
                <li>Investment portfolio information</li>
                <li>Transaction history</li>
                <li>Risk profile and investment objectives</li>
                <li>Tax-related information</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Technical Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you visit our website, we automatically collect:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>IP address and browser type</li>
                <li>Device information and operating system</li>
                <li>Pages visited and time spent on our website</li>
                <li>Referring website addresses</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Communication Data</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Email correspondence</li>
                <li>Phone call records (for quality and training purposes)</li>
                <li>WhatsApp messages and chat history</li>
                <li>Feedback and survey responses</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>To provide and maintain our financial advisory services</li>
                <li>To process transactions and manage your investments</li>
                <li>To comply with KYC (Know Your Customer) regulations</li>
                <li>To communicate with you about your account and services</li>
                <li>To send periodic emails regarding updates, promotions, and educational content</li>
                <li>To improve our website and service offerings</li>
                <li>To prevent fraud and enhance security</li>
                <li>To comply with legal and regulatory requirements</li>
              </ul>
            </section>

            {/* Data Security Measures */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Data Security Measures</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement robust security measures to protect your personal and financial information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure cloud storage with MongoDB Atlas</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection practices</li>
                <li>Encrypted backup systems</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                While we strive to protect your information, no method of transmission over the internet 
                or electronic storage is 100% secure. We cannot guarantee absolute security but are 
                committed to maintaining the highest standards of data protection.
              </p>
            </section>

            {/* Data Sharing and Disclosure */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4 font-semibold">
                We DO NOT sell your personal data to third parties.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  <strong>Service Providers:</strong> With trusted third-party service providers who assist 
                  in operating our business (e.g., payment processors, mutual fund companies, insurance providers)
                </li>
                <li>
                  <strong>Regulatory Compliance:</strong> With AMFI, IRDAI, SEBI, or other regulatory bodies 
                  when required by law
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required to comply with legal obligations, court 
                  orders, or government requests
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with any merger, sale, or transfer of 
                  business assets
                </li>
                <li>
                  <strong>With Your Consent:</strong> Any other disclosure with your explicit consent
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Right to Access:</strong> Request copies of your personal data</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate information</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal requirements)</li>
                <li><strong>Right to Restrict Processing:</strong> Request limitation on how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Right to Object:</strong> Object to processing of your data for marketing purposes</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise any of these rights, please contact us at privacy@bmwealth.co.in
              </p>
            </section>

            {/* Cookies Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Cookies Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your browsing experience:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Essential Cookies:</strong> Necessary for website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You can control cookies through your browser settings. However, disabling cookies may 
                affect the functionality of our website.
              </p>
            </section>

            {/* Third-Party Links */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our website may contain links to third-party websites (mutual fund companies, insurance 
                providers, etc.). We are not responsible for the privacy practices or content of these 
                external sites. We encourage you to review their privacy policies before providing any 
                personal information.
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to fulfill the purposes 
                outlined in this Privacy Policy, unless a longer retention period is required or permitted 
                by law.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Financial records are typically retained for 5-7 years in compliance with regulatory 
                requirements. After this period, we securely delete or anonymize your information.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our services are not intended for individuals under the age of 18. We do not knowingly 
                collect personal information from minors. If you are a parent or guardian and believe 
                your child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices 
                or legal requirements. We will notify you of any material changes by posting the updated 
                policy on our website with a revised "Last Updated" date.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Your continued use of our services after any changes constitutes your acceptance of the 
                updated Privacy Policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our 
                data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-700 mb-2"><strong>BM Wealth</strong></p>
                <p className="text-gray-700 mb-2">Proprietor: Brahmdeo Maurya</p>
                <p className="text-gray-700 mb-2">
                  Address: 66, Vinod Villa Bldg., 1st floor office no. 108,<br />
                  Cavel Cross Lane 3, Kalbadevi, Mumbai - 400002, Maharashtra, India
                </p>
                <p className="text-gray-700 mb-2">Phone: +91 8850977259</p>
                <p className="text-gray-700 mb-2">Email: privacy@bmwealth.co.in</p>
                <p className="text-gray-700">General Support: support@bmwealth.co.in</p>
              </div>
            </section>

            {/* License Information */}
            <section className="mb-8 bg-gray-50 p-6 rounded">
              <h3 className="text-xl font-semibold mb-4">Regulatory Information</h3>
              <p className="text-sm text-gray-600 mb-2">
                <strong>IRDAI License Number:</strong> 277925
              </p>
              <p className="text-sm text-gray-600">
                <strong>AMFI Registration:</strong> ARN 90008
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
