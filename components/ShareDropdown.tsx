'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type ShareDropdownLinks = {
  whatsapp?: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
};

type ShareAction = 'copyLink' | 'email' | 'whatsapp' | 'twitter' | 'linkedin' | 'pdf';

export function ShareDropdown(props: {
  label?: string;
  pageUrl?: string;
  shareText?: string;
  links?: ShareDropdownLinks;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = typeof props.open === 'boolean' ? props.open : uncontrolledOpen;
  const setOpen = (next: boolean | ((v: boolean) => boolean)) => {
    const resolved = typeof next === 'function' ? next(open) : next;
    if (props.onOpenChange) props.onOpenChange(resolved);
    if (typeof props.open !== 'boolean') setUncontrolledOpen(resolved);
  };

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const pageUrl = useMemo(() => {
    if (props.pageUrl) return props.pageUrl;
    if (typeof window === 'undefined') return '';
    return window.location.href;
  }, [props.pageUrl]);

  const shareText = useMemo(() => props.shareText || 'BM Wealth Live Intelligence', [props.shareText]);

  const computeAndApplyPosition = () => {
    const btn = buttonRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;

    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padding = 8;

    // Default: below, right-aligned to the button
    let left = rect.right - menu.offsetWidth;
    left = Math.min(Math.max(padding, left), vw - menu.offsetWidth - padding);

    let top = rect.bottom + 8;
    // Flip above if overflowing bottom
    if (top + menu.offsetHeight + padding > vh) {
      top = rect.top - menu.offsetHeight - 8;
    }
    top = Math.min(Math.max(padding, top), vh - menu.offsetHeight - padding);

    menu.style.position = 'fixed';
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.minWidth = `${Math.max(220, Math.ceil(rect.width))}px`;
  };

  useEffect(() => {
    if (!open) return;

    const tick = () => {
      computeAndApplyPosition();
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;

      // If click is inside the button or the menu (both tagged), do nothing.
      if (t.closest('[data-share-dropdown="1"]')) return;
      setOpen(false);
    };

    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const shareOptions: Array<{ icon: string; label: string; action: ShareAction }> = [
    { icon: '⧉', label: 'Copy Link', action: 'copyLink' },
    { icon: '@', label: 'Email', action: 'email' },
    { icon: 'WA', label: 'WhatsApp', action: 'whatsapp' },
    { icon: 'X', label: 'Twitter / X', action: 'twitter' },
    { icon: 'in', label: 'LinkedIn', action: 'linkedin' },
    { icon: 'PDF', label: 'Export PDF', action: 'pdf' },
  ];

  async function handleShare(action: ShareAction) {
    switch (action) {
      case 'copyLink': {
        const toCopy = pageUrl;
        const fallback = () => {
          // eslint-disable-next-line no-alert
          prompt('Copy this link:', toCopy);
        };
        try {
          if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(toCopy);
            // eslint-disable-next-line no-alert
            alert('Link copied!');
          } else {
            fallback();
          }
        } catch {
          fallback();
        }
        return;
      }
      case 'email':
        window.open(props.links?.email || `mailto:?subject=${encodeURIComponent('BM Wealth Live Intelligence')}&body=${encodeURIComponent(pageUrl)}`);
        return;
      case 'whatsapp':
        window.open(props.links?.whatsapp || `https://wa.me/?text=${encodeURIComponent(pageUrl)}`);
        return;
      case 'twitter':
        window.open(props.links?.twitter || `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent('Check BM Wealth')}`);
        return;
      case 'linkedin':
        window.open(props.links?.linkedin || `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`);
        return;
      case 'pdf':
        window.print();
        return;
    }
  }

  return (
    <div className={props.className || ''}>
      <button
        type="button"
        data-share-dropdown="1"
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        onMouseOver={(e: any) => {
          e.currentTarget.style.borderColor = 'rgba(170,198,255,0.35)';
          e.currentTarget.style.background = 'rgba(130,160,255,0.10)';
        }}
        onMouseOut={(e: any) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          e.currentTarget.style.background = 'rgba(10,10,12,0.70)';
        }}
        style={{
          appearance: 'none',
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(10,10,12,0.70)',
          color: 'rgba(235,242,255,0.85)',
          padding: '10px 16px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          transition: 'all 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>{props.label || 'Share'}</span>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
      </button>

      {open ? (
        createPortal(
          <div
            ref={menuRef}
            data-share-dropdown="1"
            style={{
              zIndex: 100000,
              minWidth: 220,
              background: 'rgba(15, 18, 25, 0.98)',
              border: '1px solid rgba(100, 160, 255, 0.20)',
              borderRadius: 14,
              padding: 8,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.50), 0 0 60px rgba(100, 160, 255, 0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {shareOptions.map((option) => (
              <button
                key={option.action}
                type="button"
                onClick={async () => {
                  await handleShare(option.action);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 14px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 10,
                  color: 'rgba(220, 230, 255, 0.85)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(100, 160, 255, 0.12)';
                  e.currentTarget.style.color = 'rgba(255,255,255,1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(220, 230, 255, 0.85)';
                }}
              >
                <span style={{ width: 22, textAlign: 'center', fontSize: 16 }}>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )
      ) : null}
    </div>
  );
}
