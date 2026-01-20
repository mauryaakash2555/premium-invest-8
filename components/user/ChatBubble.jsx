/**
 * FILE: components/user/ChatBubble.jsx
 * PURPOSE: Render a single chat message bubble.
 * CATEGORY: user
 *
 * SIMPLE EXPLANATION:
 * A chat is just a list of bubbles. This component draws one bubble.
 */

'use client';

export function ChatBubble({ sender, text, children }) {
  const isUser = sender === 'user';
  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '88%',
        padding: '12px 14px',
        borderRadius: 0,
        border: isUser
          ? '1px solid color-mix(in oklab, var(--lux-accent) 24%, rgba(255,255,255,0.10))'
          : '1px solid rgba(255,255,255,0.08)',
        background: isUser
          ? 'linear-gradient(135deg, color-mix(in oklab, var(--lux-accent) 12%, transparent), rgba(255, 255, 255, 0.02))'
          : 'rgba(255,255,255,0.03)',
        color: 'rgba(255,255,255,0.92)',
        lineHeight: 1.55,
        fontSize: 14,
        whiteSpace: 'pre-wrap',
      }}
    >
      {text}
      {children}
    </div>
  );
}
