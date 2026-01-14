'use client';

import { useState, useCallback } from 'react';
import { trackSummaryShare } from '@/lib/live-intelligence/analytics';

/**
 * WhatsAppShare - Share content to WhatsApp and opt-in for daily updates
 * 
 * Features:
 * - Share summary to WhatsApp
 * - Opt-in for daily morning/night updates
 * - Premium styling with animation
 */
export default function WhatsAppShare({ 
  summary, 
  type = 'night', 
  showOptIn = true 
}) {
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOptInForm, setShowOptInForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Format summary for WhatsApp
  const formatForWhatsApp = useCallback(() => {
    if (!summary) return '';

    let text = '';

    if (type === 'night') {
      text = `🌙 *${summary.title || 'What You Missed Today'}*\n\n`;
      
      if (summary.marketSummary) {
        text += `📊 *Markets*\n`;
        text += `NIFTY: ${summary.marketSummary.nifty?.close} (${summary.marketSummary.nifty?.changePercent})\n`;
        text += `SENSEX: ${summary.marketSummary.sensex?.close} (${summary.marketSummary.sensex?.changePercent})\n\n`;
      }

      if (summary.topHeadlines?.length > 0) {
        text += `📰 *Key Headlines*\n`;
        summary.topHeadlines.forEach((h, i) => {
          text += `${i + 1}. ${h.headline}\n`;
        });
        text += '\n';
      }

      if (summary.keyTakeaways?.length > 0) {
        text += `💡 *Takeaways*\n`;
        summary.keyTakeaways.forEach(t => {
          text += `• ${t}\n`;
        });
      }
    } else {
      text = `☀️ *${summary.title || 'Morning Briefing'}*\n\n`;
      
      if (summary.globalCues?.length > 0) {
        text += `🌍 *Global Cues*\n`;
        summary.globalCues.forEach(c => {
          const emoji = c.sentiment === 'positive' ? '🟢' : c.sentiment === 'negative' ? '🔴' : '⚪';
          text += `${emoji} ${c.text}\n`;
        });
        text += '\n';
      }

      if (summary.keyEvents?.length > 0) {
        text += `📅 *Today's Events*\n`;
        summary.keyEvents.forEach(e => {
          text += `${e.time}: ${e.event}\n`;
        });
      }
    }

    text += `\n---\n📱 Get daily updates: bmwealth.co.in`;
    
    return encodeURIComponent(text);
  }, [summary, type]);

  // Handle share to WhatsApp
  const handleShare = useCallback(() => {
    const text = formatForWhatsApp();
    const url = `https://wa.me/?text=${text}`;
    
    window.open(url, '_blank');
    trackSummaryShare(type, 'whatsapp');
  }, [formatForWhatsApp, type]);

  // Handle opt-in submission
  const handleOptIn = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      setMessage('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/whatsapp/opt-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          type: 'live_intelligence',
          preferences: {
            morning: true,
            night: true,
          },
        }),
      });

      if (response.ok) {
        setIsOptedIn(true);
        setMessage('You\'re subscribed! Expect your first update tomorrow.');
        setShowOptInForm(false);
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setMessage('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="li-whatsapp-share">
        {/* Share Button */}
        <button
          type="button"
          className="li-wa-share-btn"
          onClick={handleShare}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>Share on WhatsApp</span>
        </button>

        {/* Opt-in section */}
        {showOptIn && !isOptedIn && (
          <div className="li-wa-optin">
            {!showOptInForm ? (
              <button
                type="button"
                className="li-wa-optin-trigger"
                onClick={() => setShowOptInForm(true)}
              >
                Get daily updates on WhatsApp
              </button>
            ) : (
              <form onSubmit={handleOptIn} className="li-wa-optin-form">
                <div className="li-wa-input-group">
                  <span className="li-wa-prefix">+91</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter mobile number"
                    maxLength={10}
                    className="li-wa-input"
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type="submit"
                  className="li-wa-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
                <button
                  type="button"
                  className="li-wa-cancel"
                  onClick={() => setShowOptInForm(false)}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}

        {/* Success message */}
        {isOptedIn && (
          <div className="li-wa-success">
            ✅ You're subscribed to daily market updates!
          </div>
        )}

        {/* Error/info message */}
        {message && !isOptedIn && (
          <div className={`li-wa-message ${message.includes('wrong') || message.includes('Failed') ? 'error' : ''}`}>
            {message}
          </div>
        )}
      </div>

      <style jsx>{`
        .li-whatsapp-share {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }

        .li-wa-share-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 20px;
          background: linear-gradient(180deg, #25D366 0%, #128C7E 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .li-wa-share-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
        }

        .li-wa-optin {
          padding: 12px;
          background: rgba(20, 25, 35, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
        }

        .li-wa-optin-trigger {
          width: 100%;
          padding: 10px;
          background: transparent;
          border: 1px dashed rgba(170, 198, 255, 0.3);
          border-radius: 8px;
          color: rgba(200, 215, 240, 0.7);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .li-wa-optin-trigger:hover {
          border-color: rgba(170, 198, 255, 0.5);
          color: rgba(235, 242, 255, 0.9);
          background: rgba(170, 198, 255, 0.05);
        }

        /* Premium overlay theme override (LiveIntelligenceOverlay sets body[data-laser-active]) */
        :global(body[data-laser-active='true'] .li-wa-share-btn) {
          background: linear-gradient(180deg, rgba(170, 198, 255, 0.22) 0%, rgba(10, 10, 12, 0.85) 100%) !important;
          border: 1px solid rgba(170, 198, 255, 0.42) !important;
          color: rgba(245, 248, 255, 0.95) !important;
          box-shadow: 0 0 26px rgba(140, 190, 255, 0.14);
        }

        :global(body[data-laser-active='true'] .li-wa-share-btn:hover) {
          transform: translateY(-2px);
          box-shadow: 0 0 34px rgba(140, 190, 255, 0.22);
        }

        :global(body[data-laser-active='true'] .li-wa-optin) {
          background: linear-gradient(180deg, rgba(18, 22, 30, 0.96) 0%, rgba(10, 10, 12, 0.98) 100%);
          border-color: rgba(170, 198, 255, 0.12);
        }

        :global(body[data-laser-active='true'] .li-wa-optin-trigger) {
          border-style: solid;
          border-color: rgba(170, 198, 255, 0.18);
          color: rgba(220, 230, 255, 0.72);
          letter-spacing: 0.02em;
        }

        :global(body[data-laser-active='true'] .li-wa-optin-trigger:hover) {
          border-color: rgba(170, 198, 255, 0.32);
          color: rgba(245, 248, 255, 0.95);
          background: rgba(170, 198, 255, 0.06);
        }

        .li-wa-optin-form {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .li-wa-input-group {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 200px;
          background: rgba(10, 10, 12, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          overflow: hidden;
        }

        .li-wa-prefix {
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(200, 215, 240, 0.7);
          font-size: 14px;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .li-wa-input {
          flex: 1;
          padding: 10px 12px;
          background: transparent;
          border: none;
          color: rgba(235, 242, 255, 0.95);
          font-size: 14px;
          outline: none;
        }

        .li-wa-input::placeholder {
          color: rgba(180, 195, 230, 0.4);
        }

        .li-wa-submit {
          padding: 10px 20px;
          background: linear-gradient(180deg, rgba(170, 198, 255, 0.25) 0%, rgba(170, 198, 255, 0.12) 100%);
          border: 1px solid rgba(170, 198, 255, 0.35);
          border-radius: 8px;
          color: rgba(235, 242, 255, 0.95);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .li-wa-submit:hover:not(:disabled) {
          background: linear-gradient(180deg, rgba(170, 198, 255, 0.35) 0%, rgba(170, 198, 255, 0.18) 100%);
        }

        .li-wa-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .li-wa-cancel {
          padding: 10px;
          background: transparent;
          border: none;
          color: rgba(180, 195, 230, 0.5);
          font-size: 13px;
          cursor: pointer;
        }

        .li-wa-cancel:hover {
          color: rgba(200, 215, 240, 0.8);
        }

        .li-wa-success {
          padding: 12px;
          background: rgba(37, 211, 102, 0.12);
          border: 1px solid rgba(37, 211, 102, 0.3);
          border-radius: 8px;
          color: rgba(37, 211, 102, 0.9);
          font-size: 13px;
          text-align: center;
        }

        .li-wa-message {
          padding: 10px 12px;
          background: rgba(170, 198, 255, 0.08);
          border-radius: 6px;
          color: rgba(200, 215, 240, 0.8);
          font-size: 12px;
          text-align: center;
        }

        .li-wa-message.error {
          background: rgba(255, 100, 100, 0.12);
          color: rgba(255, 150, 150, 0.9);
        }

        @media (max-width: 640px) {
          .li-wa-optin-form {
            flex-direction: column;
          }

          .li-wa-input-group {
            min-width: 100%;
          }
        }
      `}</style>
    </>
  );
}
