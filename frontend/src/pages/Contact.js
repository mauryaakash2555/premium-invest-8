import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Send, Loader2, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // reCAPTCHA site key from environment variable
  const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load reCAPTCHA v3 script
    if (!RECAPTCHA_SITE_KEY) {
      console.error('REACT_APP_RECAPTCHA_SITE_KEY is not set');
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    return () => {
      // Cleanup: remove script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [RECAPTCHA_SITE_KEY]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get reCAPTCHA token
      if (!RECAPTCHA_SITE_KEY) {
        toast.error('reCAPTCHA is not configured. Please contact support.');
        setIsSubmitting(false);
        return;
      }
      
      // Wait for grecaptcha to be ready
      if (!window.grecaptcha) {
        toast.error('reCAPTCHA not loaded. Please refresh the page.');
        setIsSubmitting(false);
        return;
      }
      
      await new Promise((resolve) => {
        window.grecaptcha.ready(resolve);
      });
      
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
      
      // Send form data with reCAPTCHA token - with optimized timeout
      await axios.post(`${API}/contact`, {
        ...formData,
        recaptcha_token: token
      }, {
        timeout: 15000 // 15 second timeout - more reasonable for API calls
      });
      
      // Clear form immediately on success
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      // Show success message for 3 seconds
      toast.success('Message sent successfully! We\'ll contact you soon.', {
        style: {
          background: '#25D366',
          color: 'white',
          fontWeight: 'bold',
          border: 'none',
        },
        icon: '✓',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Handle different error scenarios
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Request timeout. The server is taking too long to respond. Please try again.', {
          duration: 5000,
        });
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your internet connection and try again.', {
          duration: 5000,
        });
      } else if (error.response?.status === 400 && error.response?.data?.detail === 'reCAPTCHA verification failed') {
        toast.error('Security verification failed. Please refresh the page and try again.', {
          duration: 5000,
        });
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later or contact us directly.', {
          duration: 5000,
        });
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail, {
          duration: 5000,
        });
      } else {
        toast.error('Failed to send message. Please try again or contact us via WhatsApp.', {
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Contact BM Wealth - Expert Financial Advisory Mumbai | ARN 90008</title>
        <meta name="description" content="Get in touch with BM Wealth for personalized investment advisory services. Located in Mumbai. Call, email, or visit us. SEBI registered ARN 90008." />
        <meta name="keywords" content="contact BM Wealth, investment advisor Mumbai contact, Brahmdeo Maurya contact, ARN 90008, financial advisor Mumbai" />
        <link rel="canonical" href="https://bmwealth.in/contact" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bmwealth.in/contact" />
        <meta property="og:title" content="Contact BM Wealth - Expert Financial Advisory Mumbai" />
        <meta property="og:description" content="Get in touch with BM Wealth for personalized investment advisory services. SEBI registered ARN 90008." />
        <meta property="og:image" content="https://bmwealth.in/logo.webp" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://bmwealth.in/contact" />
        <meta name="twitter:title" content="Contact BM Wealth - Expert Financial Advisory Mumbai" />
        <meta name="twitter:description" content="Get in touch with BM Wealth for personalized investment advisory services." />
        <meta name="twitter:image" content="https://bmwealth.in/logo.webp" />
      </Helmet>
      {/* Hero Section */}
      <section className="page-hero-section">
        <div
          className="page-hero-bg"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80)',
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
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
            zIndex: 0,
          }}
        />

        <div className="section-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1
            data-testid="contact-heading"
            style={{
              fontSize: 'clamp(32px, 5vw, 64px)',
              marginBottom: '24px',
            }}
            className="golden-gradient"
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '60px',
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
                className="glass-effect"
                style={{
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
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
                className="glass-effect"
                style={{
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
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
                    mauryaakash2555@gmail.com
                  </p>
                </div>
              </div>

              <div
                className="glass-effect"
                style={{
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
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

              <a
                href="https://wa.me/918850977259"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-effect"
                style={{
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
                  textDecoration: 'none',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 211, 102, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(37, 211, 102, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#25D366',
                    flexShrink: 0,
                  }}
                >
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', color: '#25D366', marginBottom: '8px' }}>
                    WhatsApp Us
                  </h3>
                  <p style={{ fontSize: '16px', color: '#CCCCCC' }}>
                    Chat with us instantly: +91 8850977259
                  </p>
                </div>
              </a>
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