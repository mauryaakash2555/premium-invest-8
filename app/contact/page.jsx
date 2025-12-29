'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Send, Loader2, MessageCircle } from 'lucide-react';
import MobileScrollBoost from '@/components/MobileScrollBoost';
import axios from 'axios';
// Render Backend API (permanent solution)
// Use NEXT_PUBLIC_ prefix for client-side access in Next.js
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bmwealth-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWhatsAppFallback, setShowWhatsAppFallback] = useState(false);
  
  // reCAPTCHA site key (from env var or fallback) - only use on production domain
  const isProduction = typeof window !== 'undefined' && window.location.hostname === 'bmwealth.co.in';
  const RECAPTCHA_SITE_KEY = isProduction ? (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LfAFSMsAAAAAOGp-tuvFm7cngZ3Xc8VY85zGqKB') : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Wake up backend when contact page loads (prevents timeout)
    if (BACKEND_URL) {
      fetch(`${BACKEND_URL}/health`)
        .then(() => console.log('Backend ready'))
        .catch(() => console.log('Backend waking up...'));
    }
    
    // Load reCAPTCHA v3 script (optional - form works without it)
    if (RECAPTCHA_SITE_KEY) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [RECAPTCHA_SITE_KEY]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let twoSecondTimer = null;
    let scrollTimer = null;

    try {
      // Get reCAPTCHA token (optional - skip if not configured)
      let recaptchaToken = null;
      if (RECAPTCHA_SITE_KEY && window.grecaptcha) {
        try {
          await new Promise((resolve) => {
            window.grecaptcha.ready(resolve);
          });
          recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
        } catch (recaptchaError) {
          console.warn('reCAPTCHA error (continuing without it):', recaptchaError);
          // Continue without reCAPTCHA - it's optional
        }
      }
      
      // Send form data with optional reCAPTCHA token - Render backend
      // 2-second timeout check with WhatsApp fallback
      
      // Set a 2-second timer to show WhatsApp fallback
      twoSecondTimer = setTimeout(() => {
        setShowWhatsAppFallback(true);
        scrollTimer = setTimeout(() => {
          const fallbackElement = document.querySelector('[data-whatsapp-fallback]');
          if (fallbackElement) {
            fallbackElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 300);
      }, 2000);
      
      const response = await axios.post(`${API}/contact`, {
        ...formData,
        recaptcha_token: recaptchaToken // null if not available
      }, {
        timeout: 30000, // 30 second timeout - faster failure for better UX
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: function (status) {
          // Accept 200-299 as success, everything else as error
          return status >= 200 && status < 300;
        },
      });
      
      // Clear the 2-second timer if request completed
      clearTimeout(twoSecondTimer);
      clearTimeout(scrollTimer);
      
      // Verify response is successful
      if (!response.data || !response.data.success) {
        throw new Error('Form submission failed');
      }
      
      // Clear form immediately on success
      setFormData({ name: '', email: '', phone: '', message: '' });
      // Always hide fallback on success
      setShowWhatsAppFallback(false);
      
      // Show success message for 3 seconds
      console.log('Form submitted successfully');
    } catch (error) {
      // Clear timers on error
      clearTimeout(twoSecondTimer);
      clearTimeout(scrollTimer);
      
      console.error('Error submitting form:', error);
      
      // Handle different error scenarios
      let shouldShowFallback = true;
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('Error submitting form');
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        console.error('Error submitting form');
      } else if (error.response?.status === 400 && error.response?.data?.detail === 'reCAPTCHA verification failed') {
        console.error('Error submitting form');
        shouldShowFallback = false; // Don't show fallback for security errors
      } else if (error.response?.status === 500 || error.response?.status >= 500) {
        console.error('Error submitting form');
      } else if (error.response?.data?.detail) {
        console.error('Error submitting form');
        // Show fallback for client errors too (except validation errors)
        if (error.response?.status !== 400 || !error.response?.data?.detail?.includes('required')) {
          shouldShowFallback = true;
        }
      } else {
        console.error('Error submitting form');
      }
      
      // Show WhatsApp fallback after error (unless it's a security/validation error)
      if (shouldShowFallback) {
        setShowWhatsAppFallback(true);
        // Scroll to fallback after a short delay for better UX
        scrollTimer = setTimeout(() => {
          const fallbackElement = document.querySelector('[data-whatsapp-fallback]');
          if (fallbackElement) {
            fallbackElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 300);
      } else {
        setShowWhatsAppFallback(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      
      {/* Hero Section */}
      <section
        style={{
          minHeight: '70vh',
          maxHeight: '70vh',
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '100px',
        }}
      >
        {/* Mumbai Skyline Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            backgroundImage:
              'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.65,
            filter: 'brightness(1.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        <div className="section-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1
            data-testid="contact-heading"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              marginBottom: '24px',
              fontWeight: 300,
              letterSpacing: '3px',
              opacity: 0.95,
              textShadow: '0 3px 12px rgba(0,0,0,0.4)',
              fontFamily: '"Playfair Display", serif',
              color: '#C0A062',
            }}
          >
            Get In Touch
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#C0A062',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Have questions about your investments? Our team is here to empower you to achieve your
            financial objectives.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="section-container">
        <style>{`
          @media (max-width: 768px) {
            .contact-grid {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
          }
        `}</style>
        <div
          className="contact-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '60px',
            maxWidth: '100%',
          }}
        >
          {/* Contact Information */}
          <div>
            <h2
              style={{
                fontSize: 'clamp(24px, 3vw, 40px)',
                marginBottom: '30px',
                color: '#DAA520',
              }}
            >
              Contact Information
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div
                className="glass-effect contact-info-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '20px',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(218, 165, 32, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DAA520',
                    flexShrink: 0,
                  }}
                >
                  <Phone size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', color: '#DAA520', marginBottom: '8px' }}>
                    Phone
                  </h3>
                  <p style={{ fontSize: '16px', color: '#CCCCCC' }}>+91 8850977259</p>
                </div>
              </div>

              <div
                className="glass-effect contact-info-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '20px',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(218, 165, 32, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DAA520',
                    flexShrink: 0,
                  }}
                >
                  <Mail size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', color: '#DAA520', marginBottom: '8px' }}>
                    Email
                  </h3>
                  <p style={{ fontSize: '16px', color: '#CCCCCC' }}>
                    support@bmwealth.co.in
                  </p>
                </div>
              </div>

              <div
                className="glass-effect contact-info-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '20px',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(218, 165, 32, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DAA520',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', color: '#DAA520', marginBottom: '8px' }}>
                    Location
                  </h3>
                  <p style={{ fontSize: '16px', color: '#CCCCCC' }}>Mumbai, Maharashtra</p>
                </div>
              </div>

              <MobileScrollBoost as="a" holdMs={6000}
                href="https://wa.me/918850977259"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-effect contact-info-card whatsapp-contact-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '20px', textDecoration: 'none', cursor: 'pointer', border: '1px solid rgba(37, 211, 102, 0.2)' }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(37, 211, 102, 0.15)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#25D366',
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(37, 211, 102, 0.25)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(37, 211, 102, 0.15)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', color: '#25D366', marginBottom: '8px', fontWeight: '600', transition: 'color 0.3s ease' }}>
                    WhatsApp Us
                  </h3>
                  <p style={{ fontSize: '16px', color: '#CCCCCC' }}>
                    Chat with us instantly: +91 8850977259
                  </p>
                </div>
              </MobileScrollBoost>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-effect" style={{ padding: '40px' }}>
            <h2
              style={{
                fontSize: 'clamp(24px, 3vw, 36px)',
                marginBottom: '30px',
                color: '#DAA520',
              }}
            >
              Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} data-testid="contact-form">
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="name"
                  style={{
                    display: 'block',
                    fontSize: '16px',
                    color: '#C0A062',
                    marginBottom: '8px',
                    fontWeight: 500,
                  }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  data-testid="contact-name-input"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'text',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#DAA520')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)')}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '16px',
                    color: '#C0A062',
                    marginBottom: '8px',
                    fontWeight: 500,
                  }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  data-testid="contact-email-input"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'text',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#DAA520')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)')}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="phone"
                  style={{
                    display: 'block',
                    fontSize: '16px',
                    color: '#C0A062',
                    marginBottom: '8px',
                    fontWeight: 500,
                  }}
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  data-testid="contact-phone-input"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'text',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#DAA520')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)')}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="message"
                  style={{
                    display: 'block',
                    fontSize: '16px',
                    color: '#C0A062',
                    marginBottom: '8px',
                    fontWeight: 500,
                  }}
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  data-testid="contact-message-input"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    resize: 'vertical',
                    transition: 'border-color 0.3s ease',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'text',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#DAA520')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="contact-submit-btn"
                className="btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send size={20} />
                  </>
                )}
              </button>

              {/* WhatsApp Fallback - Shows only when form times out or fails */}
              {showWhatsAppFallback && (
                <div 
                  data-whatsapp-fallback
                  style={{ 
                    marginTop: '24px', 
                    textAlign: 'center'
                  }}
                >
                  <a 
                    href="https://wa.me/918850977259?text=Hi%20BM%20Wealth%2C%20I%27d%20like%20to%20connect"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 24px',
                      background: 'rgba(192, 160, 98, 0.08)',
                      color: '#C0A062',
                      border: '1px solid rgba(192, 160, 98, 0.3)',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '500',
                      fontSize: '15px',
                      transition: 'all 0.4s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(218, 165, 32, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = 'rgba(218, 165, 32, 0.5)';
                      e.currentTarget.style.color = '#DAA520';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(192, 160, 98, 0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.3)';
                      e.currentTarget.style.color = '#C0A062';
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Contact via WhatsApp
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
          padding: '80px 20px',
        }}
      >
        <div className="section-container">
          <div
            className="glass-effect"
            style={{
              padding: '60px 40px',
              textAlign: 'center',
              background: 'rgba(218, 165, 32, 0.05)',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(24px, 3vw, 40px)',
                marginBottom: '16px',
                color: '#DAA520',
              }}
            >
              Initiate Your Financial Transformation
            </h2>
            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                marginBottom: '30px',
              }}
            >
              Subscribe to our newsletter for weekly financial insights and podcast updates
            </p>
            <div className="sebi-disclaimer">
              <strong>Note:</strong> We respect your privacy and will never share your
              information with third parties.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;





