import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

const WhatsAppFloat = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <a
        href="https://wa.me/918850977259"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        data-testid="whatsapp-float-button"
        aria-label="Chat with us on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <MessageCircle size={32} />
      </a>
      {showTooltip && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '30px',
            background: '#25D366',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 999,
            fontWeight: '500',
          }}
        >
          Chat with us Instantly
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              right: '20px',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #25D366',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default WhatsAppFloat;