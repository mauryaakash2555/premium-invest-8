'use client';

import { useChat } from 'ai/react';

export default function GrokChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/grok',
  });

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '380px',
        background: '#111',
        border: '2px solid #ffd700',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 0 20px rgba(255,215,0,0.4)',
        zIndex: 9999,
        fontFamily: 'Arial, sans-serif',
        color: '#fff',
      }}
    >
      <h3 style={{ color: '#ffd700', margin: '0 0 12px 0', textAlign: 'center' }}>
        Ask BM Wealth AI (Grok-4)
      </h3>

      <div
        style={{
          height: '300px',
          overflowY: 'auto',
          marginBottom: '12px',
          padding: '8px',
          background: '#000',
          borderRadius: '8px',
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: '#888', fontSize: '14px', textAlign: 'center' }}>
            Ask anything about SIP, Mutual Funds, LIC, PMS...
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              margin: '8px 0',
              textAlign: m.role === 'user' ? 'right' : 'left',
            }}
          >
            <span
              style={{
                background: m.role === 'user' ? '#ffd700' : '#333',
                color: m.role === 'user' ? '#000' : '#fff',
                padding: '8px 12px',
                borderRadius: '12px',
                display: 'inline-block',
                maxWidth: '80%',
                fontSize: '14px',
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Best SIP in Mumbai?"
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px 0 0 8px',
            border: '1px solid #ffd700',
            background: '#000',
            color: '#fff',
            fontSize: '14px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 16px',
            background: '#ffd700',
            color: '#000',
            border: 'none',
            borderRadius: '0 8px 8px 0',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
