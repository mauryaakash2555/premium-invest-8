/**
 * FILE: components/WhatsAppFloat.jsx
 * PURPOSE: Floating WhatsApp button that opens the on-site AI chat modal.
 * CATEGORY: user
 *
 * DEPENDENCIES:
 * - components/user/AIChatFloat.jsx
 * - components/shared/ChatErrorBoundary.jsx
 *
 * SIMPLE EXPLANATION:
 * This shows a small chat icon on the page.
 * When you click it, the AI chat window opens.
 */

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AIChatFloat from '@/components/user/AIChatFloat';
import ChatErrorBoundary from '@/components/shared/ChatErrorBoundary';
import Chatbot3DTrigger from '../../src/components/Chatbot3DTrigger';

const WhatsAppFloat = () => {
  const [open, setOpen] = useState(false);
  const whatsappHref = "https://wa.me/918850977259";
  const pathname = usePathname();

  if (pathname?.startsWith('/live-intelligence')) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* 🔵 Floating 3D bot trigger (keeps existing chat logic) */}
      <Chatbot3DTrigger
        className="chatbot-float"
        aria-label="Open chat"
        size={200}
        onActivate={() => setOpen(true)}
      />

      {/* 🔵 AI Chat modal */}
      <ChatErrorBoundary>
        <AIChatFloat open={open} onClose={() => setOpen(false)} whatsappHref={whatsappHref} />
      </ChatErrorBoundary>
    </div>
  );
};

export default WhatsAppFloat;
