import React from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const RefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Refund Policy - BM Wealth</title>
        <meta name="description" content="Refund and cancellation policy for BM Wealth services" />
      </Helmet>
      
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Refund Policy</h1>
          <p className="text-gray-500 mb-8">Last Updated: December 8, 2025</p>
          
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                At BM Wealth, we are committed to providing high-quality financial advisory services. 
                This Refund Policy outlines the terms and conditions for refunds and cancellations 
                across our various service offerings.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Please read this policy carefully before making any payments or engaging our services.
              </p>
            </section>

            {/* Advisory and Consultation Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Advisory and Consultation Services</h2>
              
              <h3 className="text-xl font-semibold mb-3">Cancellation Policy</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                For one-time consultation or advisory sessions:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  <strong>Full Refund:</strong> Available if cancelled within 24 hours of payment 
                  and before the scheduled consultation
                </li>
                <li>
                  <strong>50% Refund:</strong> Available if cancelled 24-48 hours before the scheduled consultation
                </li>
                <li>
                  <strong>No Refund:</strong> If cancelled less than 24 hours before the consultation 
                  or after the service has been provided
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Rescheduling</h3>
              <p className="text-gray-700 leading-relaxed">
                You may reschedule your consultation once free of charge if done at least 48 hours 
                in advance. Additional rescheduling requests may be subject to a rescheduling fee.
              </p>
            </section>

            {/* Subscription Plans */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Subscription Plans and Ongoing Advisory Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For monthly, quarterly, or annual subscription plans:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  <strong>Trial Period:</strong> If applicable, you may cancel during the trial period 
                  for a full refund of any fees paid
                </li>
                <li>
                  <strong>Pro-rated Refund:</strong> If you cancel mid-subscription, you may be eligible 
                  for a pro-rated refund for the unused portion, minus any discounts received
                </li>
                <li>
                  <strong>No Refund After Services Rendered:</strong> Once advisory services have been 
                  substantially provided for the billing period, no refund will be issued
                </li>
                <li>
                  <strong>Annual Plans:</strong> Refunds for annual plans are calculated on a pro-rated 
                  basis for unused months, subject to a 15% administrative fee
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To cancel a subscription, you must provide written notice to refunds@bmwealth.co.in 
                at least 7 days before the next billing cycle.
              </p>
            </section>

            {/* Mutual Fund Transactions */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Mutual Fund Transactions</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Important considerations for mutual fund investments:
              </p>
              
              <h3 className="text-xl font-semibold mb-3">Exit Loads</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Mutual funds may charge exit loads if you redeem your units before a specified period. 
                These charges are determined by the respective mutual fund companies and are disclosed 
                in the scheme documents.
              </p>

              <h3 className="text-xl font-semibold mb-3">Transaction Charges</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                As per SEBI regulations, a transaction charge may be applicable for investments in 
                mutual funds:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>₹100 per subscription of ₹10,000 and above (for new investors)</li>
                <li>₹150 per subscription of ₹10,000 and above (for existing investors)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                These charges are NOT refundable as they are remitted to the mutual fund company.
              </p>

              <h3 className="text-xl font-semibold mb-3">Distribution Commission</h3>
              <p className="text-gray-700 leading-relaxed">
                BM Wealth receives commission from mutual fund companies for distribution services. 
                This commission is embedded in the scheme and does NOT result in any additional cost 
                to investors. It is NOT refundable.
              </p>
            </section>

            {/* Insurance Products */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Insurance Products</h2>
              
              <h3 className="text-xl font-semibold mb-3">Free Look Period</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Most insurance policies come with a "Free Look Period" (typically 15-30 days from 
                policy receipt):
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>You can cancel the policy during this period</li>
                <li>The insurance company will refund the premium paid, minus proportionate risk premium, 
                stamp duty, and medical examination charges</li>
                <li>The free look period terms are specific to each insurance company and policy type</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">After Free Look Period</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Once the free look period expires:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Policy cancellation (surrender) will be subject to surrender charges as per policy terms</li>
                <li>Surrender value may be significantly lower than premiums paid, especially in early policy years</li>
                <li>Unit-linked insurance plans (ULIPs) have specific surrender charge structures</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Advisory Fees</h3>
              <p className="text-gray-700 leading-relaxed">
                Any advisory fees paid to BM Wealth for insurance consultation are separate from policy 
                premiums and are generally non-refundable once the consultation has been provided.
              </p>
            </section>

            {/* Digital Products and Content */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Digital Products and Content</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For e-books, financial planning templates, research reports, and other digital content:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  <strong>7-Day Refund Window:</strong> You may request a refund within 7 days of purchase 
                  if the content is materially different from what was advertised
                </li>
                <li>
                  <strong>No Refund After Access:</strong> Once you have downloaded or accessed the digital 
                  content, refunds are generally not available unless there is a technical issue
                </li>
                <li>
                  <strong>Defective Content:</strong> If the content is defective or corrupted, we will 
                  provide a replacement or full refund
                </li>
              </ul>
            </section>

            {/* Webinars and Online Events */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Webinars and Online Events</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For paid webinars, workshops, and online events:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  <strong>Full Refund:</strong> Available if you cancel at least 7 days before the event date
                </li>
                <li>
                  <strong>50% Refund:</strong> Available if you cancel 3-7 days before the event
                </li>
                <li>
                  <strong>No Refund:</strong> Within 72 hours of the event or after the event has taken place
                </li>
                <li>
                  <strong>Event Cancellation:</strong> If we cancel an event, you will receive a full refund 
                  or credit towards a future event
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Recorded sessions, if provided, are considered delivered content and are non-refundable 
                once access is granted.
              </p>
            </section>

            {/* Refund Processing Time */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Refund Processing Time</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Once a refund request is approved:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  <strong>Processing Time:</strong> 7-14 business days from the date of approval
                </li>
                <li>
                  <strong>Refund Method:</strong> Refunds will be issued to the original payment method 
                  (bank account, credit card, UPI, etc.)
                </li>
                <li>
                  <strong>Bank Processing:</strong> Additional 5-7 business days may be required for the 
                  refund to reflect in your account, depending on your bank
                </li>
                <li>
                  <strong>Notification:</strong> You will receive an email confirmation once the refund 
                  has been processed
                </li>
              </ul>
            </section>

            {/* Non-Refundable Items */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Non-Refundable Items and Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The following are generally non-refundable:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Completed consultation sessions</li>
                <li>Services already rendered</li>
                <li>Mutual fund transaction charges and distribution commissions</li>
                <li>Third-party fees (insurance premiums paid to insurance companies, etc.)</li>
                <li>Processing fees and administrative charges</li>
                <li>Promotional or discounted services (unless legally required)</li>
                <li>Custom financial plans after delivery</li>
              </ul>
            </section>

            {/* How to Request a Refund */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. How to Request a Refund</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To request a refund, please follow these steps:
              </p>
              <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  Send an email to <strong>refunds@bmwealth.co.in</strong> with the subject line 
                  "Refund Request - [Your Name]"
                </li>
                <li>
                  Include the following information:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Your full name and contact information</li>
                    <li>Date and amount of payment</li>
                    <li>Service or product for which you're requesting a refund</li>
                    <li>Reason for the refund request</li>
                    <li>Transaction ID or receipt number</li>
                  </ul>
                </li>
                <li>
                  We will review your request within 5 business days and respond with our decision
                </li>
                <li>
                  If approved, the refund will be processed as per the timelines mentioned above
                </li>
              </ol>
              <p className="text-gray-700 leading-relaxed">
                For urgent matters, you may also call us at +91 8850977259 during business hours 
                (Monday-Saturday, 10:00 AM - 6:00 PM IST).
              </p>
            </section>

            {/* Dispute Resolution */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you disagree with our refund decision:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  You may escalate the matter by emailing grievance@bmwealth.co.in with "Refund Dispute" 
                  in the subject line
                </li>
                <li>
                  We will conduct a thorough review and respond within 15 business days
                </li>
                <li>
                  If still unresolved, you may approach the relevant consumer forum or regulatory authority
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                All disputes are subject to the jurisdiction of courts in Mumbai, Maharashtra, India.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to modify this Refund Policy at any time. Changes will be effective 
                immediately upon posting on our website with an updated "Last Updated" date.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Refund requests for services purchased before a policy change will be processed according 
                to the policy in effect at the time of purchase.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about this Refund Policy or to request a refund:
              </p>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-700 mb-2"><strong>BM Wealth</strong></p>
                <p className="text-gray-700 mb-2">Proprietor: Brahmdeo Maurya</p>
                <p className="text-gray-700 mb-2">
                  Address: 66, Vinod Villa Bldg., 1st floor office no. 108,<br />
                  Cavel Cross Lane 3, Kalbadevi, Mumbai - 400002, Maharashtra, India
                </p>
                <p className="text-gray-700 mb-2">Phone: +91 8850977259</p>
                <p className="text-gray-700 mb-2">Email: refunds@bmwealth.co.in</p>
                <p className="text-gray-700 mb-2">General Support: support@bmwealth.co.in</p>
                <p className="text-gray-700">Grievances: grievance@bmwealth.co.in</p>
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

export default RefundPolicy;
