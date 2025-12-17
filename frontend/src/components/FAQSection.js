import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSection = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div style={{ marginTop: '60px', marginBottom: '60px' }}>
      <h2
        style={{
          fontSize: 'clamp(28px, 4vw, 36px)',
          color: '#DAA520',
          marginBottom: '30px',
          fontFamily: "'Playfair Display', serif",
        }}
      >
        Frequently Asked Questions
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(192, 160, 98, 0.05)',
              border: '1px solid rgba(192, 160, 98, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
          >
            <button
              onClick={() => toggleFAQ(index)}
              style={{
                width: '100%',
                padding: '20px 24px',
                background: 'none',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left',
                gap: '16px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(192, 160, 98, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <span
                style={{
                  fontSize: '18px',
                  color: '#DAA520',
                  fontWeight: '600',
                  lineHeight: 1.4,
                }}
              >
                {faq.question}
              </span>
              {openIndex === index ? (
                <ChevronUp size={24} color="#DAA520" style={{ flexShrink: 0 }} />
              ) : (
                <ChevronDown size={24} color="#C0A062" style={{ flexShrink: 0 }} />
              )}
            </button>
            {openIndex === index && (
              <div
                style={{
                  padding: '0 24px 24px 24px',
                  fontSize: '16px',
                  color: '#E5E5E5',
                  lineHeight: 1.8,
                  animation: 'fadeIn 0.3s ease-in',
                }}
              >
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;


