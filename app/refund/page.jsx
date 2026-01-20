/**
 * FILE: app\refund\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
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

import React from 'react';
import { useEffect } from 'react';
import { getBodyTextPaletteStyles } from '@/lib/ui/bodyTextPaletteStyles';

const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: '.bp-body' });
const RefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      
      
      <div style={{ minHeight: '100vh', background: '#000000', paddingTop: '120px', paddingBottom: '80px' }}>
        <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 6vw, 48px)',
            fontWeight: '700',
            color: 'var(--lux-accent)',
            marginBottom: '12px',
            lineHeight: '1.2'
          }}>Refund Policy</h1>
          <p style={{ fontSize: '16px', color: '#999', marginBottom: '40px' }}>Last Updated: December 8, 2025</p>
          
          <div className="bp-body">
            {/* Introduction */}
            <section style={{ marginBottom: '40px' }}>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                At BM Wealth, we are committed to providing high-quality services. 
                This Refund Policy outlines the terms and conditions for refunds and cancellations 
                across our various service offerings.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                Digital Products / Tools: If you purchase a digital product, downloadable content, or access to an online tool,
                the purchase is generally non-refundable once access is granted or the digital delivery has been completed.
                If you face any access or delivery issue, please contact us and we will work to resolve it.
              </p>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                Please read this policy carefully before making any payments or engaging our services.
              </p>
            </section>

            {/* Consultation and Support Services */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>1. Consultation and Support Services</h2>
              
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#E5E5E5', marginTop: '24px', marginBottom: '16px' }}>Cancellation Policy</h3>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                For one-time consultation sessions:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Full Refund:</strong> Available if cancelled within 24 hours of payment 
                  and before the scheduled consultation
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>50% Refund:</strong> Available if cancelled 24-48 hours before the scheduled consultation
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>
                  <strong style={{ color: '#E5E5E5' }}>No Refund:</strong> If cancelled less than 24 hours before the consultation 
                  or after the service has been provided
                </li>
              </ul>

              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#E5E5E5', marginTop: '24px', marginBottom: '16px' }}>Rescheduling</h3>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                You may reschedule your consultation once free of charge if done at least 48 hours 
                in advance. Additional rescheduling requests may be subject to a rescheduling fee.
              </p>
            </section>

            {/* Mutual Fund Transactions */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>2. Mutual Fund Transactions</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                Important considerations for mutual fund investments:
              </p>
              
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#E5E5E5', marginTop: '24px', marginBottom: '16px' }}>Exit Loads</h3>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                Mutual funds may charge exit loads if you redeem your units before a specified period. 
                These charges are determined by the respective mutual fund companies and are disclosed 
                in the scheme documents.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#E5E5E5', marginTop: '24px', marginBottom: '16px' }}>Transaction Charges</h3>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                As per SEBI regulations, a transaction charge may be applicable for investments in 
                mutual funds:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>₹100 per subscription of ₹10,000 and above (for new investors)</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>₹150 per subscription of ₹10,000 and above (for existing investors)</li>
              </ul>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                These charges are NOT refundable as they are remitted to the mutual fund company.
              </p>
            </section>

            {/* Insurance Products */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>3. Insurance Products</h2>
              
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#E5E5E5', marginTop: '24px', marginBottom: '16px' }}>Free Look Period</h3>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                Most insurance policies come with a "Free Look Period" (typically 15-30 days from 
                policy receipt):
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>You can cancel the policy during this period</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>The insurance company will refund the premium paid, minus proportionate risk premium, 
                stamp duty, and medical examination charges</li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>The free look period terms are specific to each insurance company and policy type</li>
              </ul>

              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#E5E5E5', marginTop: '24px', marginBottom: '16px' }}>Advisory Fees</h3>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                Any advisory fees paid to BM Wealth for insurance consultation are separate from policy 
                premiums and are generally non-refundable once the consultation has been provided.
              </p>
            </section>

            {/* Refund Processing Time */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>4. Refund Processing Time</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                Once a refund request is approved:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: 0, color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Processing Time:</strong> 5–7 working days from the date of approval
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Refund Method:</strong> Refunds will be issued to the original payment method 
                  (bank account, credit card, UPI, etc.)
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  <strong style={{ color: '#E5E5E5' }}>Bank Processing:</strong> Additional time may be required for the refund to reflect
                  in your account, depending on your bank/payment provider
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>
                  <strong style={{ color: '#E5E5E5' }}>Notification:</strong> You will receive an email confirmation once the refund 
                  has been processed
                </li>
              </ul>
            </section>

            {/* How to Request a Refund */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>5. How to Request a Refund</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                To request a refund, please follow these steps:
              </p>
              <ol style={{ listStyleType: 'decimal', paddingLeft: '24px', marginBottom: '20px', color: '#B8B8B8' }}>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  Send an email to <strong style={{ color: 'var(--lux-accent)' }}>refunds@bmwealth.co.in</strong> with the subject line 
                  "Refund Request - [Your Name]"
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  Include your full name, contact information, transaction details, and reason for refund
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '12px' }}>
                  We will review your request within 5 business days and respond with our decision
                </li>
                <li style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 0 }}>
                  If approved, the refund will be processed as per the timelines mentioned above
                </li>
              </ol>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', margin: 0 }}>
                For urgent matters, you may also call us at +91 8850977259 during business hours 
                (Monday-Saturday, 10:00 AM - 6:00 PM IST).
              </p>
            </section>

            {/* Contact Information */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>6. Contact Information</h2>
              <p style={{ fontSize: '16px', color: '#B8B8B8', lineHeight: '1.8', marginBottom: '20px' }}>
                For questions about this Refund Policy or to request a refund:
              </p>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '24px',
                borderRadius: '0px',
                border: '1px solid color-mix(in oklab, var(--lux-accent) 22%, transparent)'
              }}>
                <p style={{ fontSize: '16px', color: '#E5E5E5', marginBottom: '12px' }}><strong>BM Wealth</strong></p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>Proprietor: Brahmdeo Maurya</p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>
                  Address: 66, Vinod Villa Bldg., 1st floor office no. 108, Cavel Cross Lane 3, Kalbadevi, Mumbai - 400002, Maharashtra, India
                </p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>Phone: +91 8850977259</p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', marginBottom: '12px' }}>Email: refunds@bmwealth.co.in</p>
                <p style={{ fontSize: '16px', color: '#B8B8B8', margin: 0 }}>Grievances: grievance@bmwealth.co.in</p>
              </div>
            </section>

            {/* License Information */}
            <section style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '24px',
              borderRadius: '0px',
              border: '1px solid color-mix(in oklab, var(--lux-accent) 22%, transparent)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--lux-accent)',
                marginBottom: '16px'
              }}>Regulatory Information</h3>
              <p style={{ fontSize: '14px', color: '#B8B8B8', marginBottom: '8px' }}>
                <strong style={{ color: '#E5E5E5' }}>IRDAI License Number:</strong> 277925
              </p>
              <p style={{ fontSize: '14px', color: '#B8B8B8', margin: 0 }}>
                <strong style={{ color: '#E5E5E5' }}>AMFI Registration:</strong> ARN 90008
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;
