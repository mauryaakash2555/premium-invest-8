import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API}/contact`, formData);
      toast.success('Message sent successfully! We will contact you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          minHeight: '50vh',
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
            bottom: 0,
            backgroundImage:
              'url(https://images.unsplash.com/photo-1666289158111-7576ce2ccfae?crop=entropy&cs=srgb&fm=jpg&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
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
            Have questions about your investments? Our team is here to help you achieve your
            financial goals.
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
                data-testid="contact-whatsapp-link"
                style={{
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  textDecoration: 'none',
                  transition: 'transform 0.3s ease, background 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.background = 'rgba(37, 211, 102, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    background: '#25D366',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', color: '#25D366', marginBottom: '8px' }}>
                    WhatsApp
                  </h3>
                  <p style={{ fontSize: '16px', color: '#CCCCCC' }}>Chat with us instantly</p>
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
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
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
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
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
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
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
                {isSubmitting ? 'Sending...' : 'Send Message'}
                <Send size={20} />
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
              Stay Updated with BM Wealth
            </h2>
            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                marginBottom: '30px',
              }}
            >
              Subscribe to our newsletter for weekly financial tips and podcast updates
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