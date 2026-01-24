/**
 * FILE: app\curated-partners\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
 * - next/link
 * - lucide-react
 * - @/components/user/MobileScrollBoost
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, TrendingUp, Users, CheckCircle, Calendar, Sparkles, Award, Star } from 'lucide-react';
import MobileScrollBoost from '@/components/user/MobileScrollBoost';
import { getBodyTextPaletteStyles } from '@/lib/ui/bodyTextPaletteStyles';

const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: '.bp-body' });

export default function CuratedPartners() {
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', overflowX: 'hidden' }}>

      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />

      {/* Hero Section */}
      <section
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '80px',
          paddingBottom: '60px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(900px 520px at 70% 0%, color-mix(in oklab, var(--lux-accent) 10%, transparent), transparent 65%), linear-gradient(135deg, rgba(10,10,10,0.68) 0%, rgba(10,10,10,0.86) 100%)',
          }}
        />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', maxWidth: '1000px' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 0,
              padding: '10px 24px',
              marginBottom: '24px',
              boxShadow: '0 16px 60px rgba(0,0,0,0.55)',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: 'var(--lux-accent)',
                fontWeight: 700,
                letterSpacing: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Award size={18} />
              FEATURED ADVISORY PARTNERS
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(40px, 6vw, 58px)',
              marginBottom: '20px',
              fontWeight: 400,
              letterSpacing: '4px',
              fontFamily: '"Playfair Display", serif',
              color: 'var(--lux-accent)',
              lineHeight: 1.2,
              textShadow: '0 6px 30px color-mix(in oklab, var(--lux-accent) 20%, transparent)',
            }}
          >
            Partner Placement Framework
          </h1>
          <div
            style={{
              display: 'inline-block',
              marginBottom: '16px',
              padding: '10px 16px',
              borderRadius: 0,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.78)',
              fontSize: '12px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            Invite-Only
          </div>
          <p
            style={{
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              color: 'rgba(255, 255, 255, 0.95)',
              maxWidth: '750px',
              margin: '0 auto',
              lineHeight: 1.8,
              fontWeight: 300,
            }}
          >
            Partner placements are reviewed periodically for fit, transparency, and client experience.
          </p>
        </div>
      </section>

      {/* Partner Cards Section */}
      <section className="bp-body" style={{ padding: '40px 0 100px', width: '100%' }}>
        
        {/* POSITION #1 - DIAMOND PARTNER (INVITE-ONLY PLACEMENT) */}
        <MobileScrollBoost
          className="partner-card diamond-shiny-card"
          holdMs={5000}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            width: 'calc(100% - 30px)',
            marginLeft: '15px',
            marginRight: '15px',
            background: hoveredCard === 1 
              ? 'radial-gradient(900px 700px at 20% 15%, rgba(255,255,255,0.08), transparent 62%), linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.68) 100%)'
              : 'radial-gradient(900px 700px at 20% 15%, rgba(255,255,255,0.06), transparent 62%), linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.62) 100%)',
            border: '2px solid color-mix(in oklab, var(--lux-accent) 45%, transparent)',
            borderRadius: 0,
            padding: '60px 50px',
            marginBottom: '30px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '40px',
            alignItems: 'center',
            minHeight: '400px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: hoveredCard === 1 
              ? '0 30px 120px rgba(0,0,0,0.75), 0 0 0 1px color-mix(in oklab, var(--lux-accent) 14%, transparent) inset'
              : '0 15px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.10) inset',
            transform: hoveredCard === 1 ? 'translateY(-12px) scale(1.02)' : 'none',
            cursor: 'pointer',
          }}
        >
          {/* Super Shiny Overlays - Diamond Intensity */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[linearSweep_1.2s_infinite] opacity-100" />
            <div className="absolute top-0 left-0 w-full h-full opacity-60 gold-grain-texture" />
            <div className="absolute -inset-40 bg-gradient-to-tr from-[color-mix(in_oklab,var(--lux-accent)_14%,transparent)] via-transparent to-[color-mix(in_oklab,var(--lux-accent)_14%,transparent)] animate-pulse duration-[2s]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.10),_transparent_70%)] animate-ambientGlowPulse" />
          </div>

          {/* Elite badge */}
          <div
            className="elite-badge"
            style={{
              position: 'absolute',
              top: '25px',
              right: '25px',
              background: 'linear-gradient(135deg, #FFF 0%, var(--lux-accent) 55%, #FFF 100%)',
              color: '#000',
              padding: '12px 28px',
              borderRadius: 0,
              fontSize: '14px',
              fontWeight: 900,
              letterSpacing: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 18px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.35) inset',
              zIndex: 10,
              border: '2px solid #FFF',
              animation: 'pulse 2s infinite',
            }}
          >
            <Star size={16} fill="#000" className="animate-spin-slow" />
            INVITE-ONLY
          </div>

          {/* Left Side */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '25px' }} className="card-header-flex">
              <span style={{ fontSize: '72px', filter: 'drop-shadow(0 0 30px color-mix(in oklab, var(--lux-accent) 90%, transparent))' }}>💎</span>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFF', letterSpacing: '5px', marginBottom: '8px', textShadow: '0 0 15px color-mix(in oklab, var(--lux-accent) 100%, transparent)' }}>
                  PARTNER PLACEMENT
                </div>
                <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontFamily: '"Playfair Display", serif', color: '#FFF', fontWeight: 900, margin: 0, letterSpacing: '3px', textShadow: '0 0 30px color-mix(in oklab, var(--lux-accent) 80%, transparent)' }}>
                  DIAMOND PARTNER
                </h2>
              </div>
            </div>

            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.70)', marginBottom: '26px', fontWeight: 600, letterSpacing: '0.6px' }}>
              Expression of interest is available for qualified partners.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[
                'Premium placement within our partner framework',
                'Clear positioning, disclosures, and compliance-first tone',
                'Lead intake via BM Wealth contact workflows',
                'Periodic review for fit and client experience',
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '16px 24px',
                    borderRadius: 0,
                    border: '1px solid rgba(255,255,255,0.14)',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <Sparkles size={20} style={{ color: '#FFF', flexShrink: 0, filter: 'drop-shadow(0 0 8px #FFF)' }} />
                  <span style={{ fontSize: '17px', color: '#FFF', lineHeight: 1.6, fontWeight: 700 }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '25px', position: 'relative', zIndex: 1 }} className="card-right-side">
            <div style={{ textAlign: 'center', background: 'rgba(0, 0, 0, 0.65)', padding: '35px 45px', borderRadius: 0, border: '1px solid color-mix(in oklab, var(--lux-accent) 35%, transparent)', marginBottom: '15px', boxShadow: '0 20px 80px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '14px', color: 'var(--lux-accent)', marginBottom: '12px', letterSpacing: '0.26em', fontWeight: 900, textTransform: 'uppercase' }}>
                Review Status
              </div>
              <div style={{ fontSize: '28px', color: '#FFF', fontWeight: 800, fontFamily: '"Playfair Display", serif', letterSpacing: '0.5px' }}>
                Invite-only
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.70)', marginTop: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>
                Selection based on fit and client experience
              </div>
            </div>

            <Link href="/contact?subject=diamond-expression-of-interest" className="btn-diamond-shiny">
              Expression of Interest
            </Link>
          </div>
        </MobileScrollBoost>

        {/* POSITION #2 - BM WEALTH (GOLD PARTNER) */}
        <MobileScrollBoost
          className="partner-card"
          holdMs={4500}
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            width: 'calc(100% - 30px)',
            marginLeft: '15px',
            marginRight: '15px',
            background: hoveredCard === 2
              ? 'radial-gradient(900px 520px at 30% 10%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(135deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.60) 100%)'
              : 'radial-gradient(900px 520px at 30% 10%, rgba(255,255,255,0.04), transparent 60%), linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.58) 100%)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 0,
            padding: '60px 50px',
            marginBottom: '30px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '40px',
            alignItems: 'center',
            minHeight: '320px',
            position: 'relative',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: hoveredCard === 2
              ? '0 20px 70px rgba(0,0,0,0.65), 0 0 0 1px color-mix(in oklab, var(--lux-accent) 10%, transparent) inset'
              : '0 14px 55px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
            transform: hoveredCard === 2 ? 'translateY(-4px)' : 'none',
            cursor: 'pointer',
          }}
        >
          {/* Verified badge */}
          <div 
            className="verified-badge"
            style={{ 
              position: 'absolute', 
              top: '20px', 
              right: '20px', 
              background: 'rgba(255,255,255,0.04)', 
              border: '1px solid rgba(255,255,255,0.14)', 
              color: 'rgba(255,255,255,0.88)', 
              padding: '8px 16px', 
              borderRadius: 0, 
              fontSize: '12px', 
              fontWeight: 700, 
              letterSpacing: '1px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              zIndex: 10
            }}
          >
            <CheckCircle size={14} />
            VERIFIED PARTNER
          </div>

          {/* Left Side */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }} className="card-header-flex">
              <div style={{ background: 'oklch(0.95 0.01 85)', padding: '8px 18px', borderRadius: 0, fontSize: '16px', fontWeight: 800, color: 'oklch(0.06 0.005 280)', letterSpacing: '2px', boxShadow: '0 10px 35px rgba(0,0,0,0.45)' }}>
                #2 - GOLD PARTNER
              </div>
            </div>

            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.95)', fontWeight: 700, margin: '0 0 14px 0', letterSpacing: '2px', textShadow: '0 8px 30px rgba(0,0,0,0.55)' }}>
              BM WEALTH
            </h2>

            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.72)', marginBottom: '20px', fontWeight: 600 }}>
              Premium wealth services + distribution support
            </p>

            <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.7, marginBottom: '24px' }}>
              A process-led approach across products, execution, and documentation—delivered with premium clarity.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }} className="features-grid">
              {[
                { icon: <TrendingUp size={20} />, text: 'Portfolio planning & asset allocation' },
                { icon: <Shield size={20} />, text: 'Insurance planning & claims-ready support' },
                { icon: <CheckCircle size={20} />, text: 'Tax coordination awareness' },
                { icon: <Users size={20} />, text: 'Goal planning checklists' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', padding: '12px 14px', borderRadius: 0, border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.3s ease' }}>
                  <div style={{ color: 'var(--lux-accent)', flexShrink: 0 }}>{item.icon}</div>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.4, fontWeight: 500 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'inline-block', padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 0, border: '1px solid color-mix(in oklab, var(--lux-accent) 22%, rgba(255,255,255,0.10))', boxShadow: '0 12px 40px rgba(0,0,0,0.45)' }}>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.88)', margin: 0, fontWeight: 700, letterSpacing: '0.5px' }}>
                <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                <span style={{ color: 'var(--lux-accent)' }}>AMFI Registered</span> | IRDAI Licensed
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="card-right-side">
            <Link href="/contact" className="btn-gold">
              <Calendar size={20} />
              Contact
            </Link>
          </div>
        </MobileScrollBoost>

        {/* POSITION #3 - SILVER PARTNER (RESERVED) */}
        <MobileScrollBoost
          className="partner-card"
          holdMs={4500}
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            width: 'calc(100% - 30px)',
            marginLeft: '15px',
            marginRight: '15px',
            background: hoveredCard === 3
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.6) 100%)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 0,
            padding: '60px 50px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '40px',
            alignItems: 'center',
            minHeight: '280px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: hoveredCard === 3 ? 'translateY(-2px)' : 'none',
            boxShadow: hoveredCard === 3 ? '0 18px 70px rgba(0,0,0,0.55)' : 'none',
            cursor: 'pointer',
          }}
        >
          {/* Left Side */}
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '2px', marginBottom: '16px' }}>
              #3 - SILVER PARTNER
            </div>

            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontFamily: '"Playfair Display", serif', color: 'rgba(255,255,255,0.92)', fontWeight: 600, margin: '0 0 14px 0', letterSpacing: '2px' }}>
              Partnership Position Available
            </h2>

            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '24px', lineHeight: 1.7 }}>
              We carefully select partners who meet our high standards for transparency, compliance, and client service excellence.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Regulatory compliance & licensing',
                'Transparent pricing structure',
                'Strong investor protection measures',
                'Excellent user experience & support',
              ].map((criterion, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                  <CheckCircle size={18} style={{ color: 'var(--lux-accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6 }}>
                    {criterion}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="card-right-side">
            <Link href="/contact?subject=partnership" className="btn-outline-gold">
              Apply for Partnership
            </Link>
          </div>
        </MobileScrollBoost>

      </section>

      <style>{`
        .partner-card {
          text-align: left;
        }
        
        .btn-gold {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          position: relative;
          overflow: hidden;
          background: oklch(0.95 0.01 85);
          color: oklch(0.06 0.005 280);
          padding: 20px 40px;
          border-radius: 0;
          text-decoration: none;
          font-size: 17px;
          font-weight: 800;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          box-shadow: 0 16px 60px rgba(0,0,0,0.55);
          border: 1px solid rgba(255,255,255,0.14);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .btn-gold::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--lux-accent);
          transform: translateX(-101%);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1;
        }

        .btn-gold > * { position: relative; z-index: 2; }
        
        .btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 80px rgba(0,0,0,0.65);
        }

        .btn-gold:hover::before {
          transform: translateX(0);
        }

        .btn-diamond-shiny {
          display: inline-flex;
          align-items: center;
          gap: 15px;
          position: relative;
          overflow: hidden;
          background: oklch(0.95 0.01 85);
          color: oklch(0.06 0.005 280);
          padding: 24px 48px;
          border-radius: 0;
          text-decoration: none;
          font-size: 18px;
          font-weight: 900;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          box-shadow: 0 22px 90px rgba(0,0,0,0.65);
          border: 1px solid rgba(255,255,255,0.18);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .btn-diamond-shiny::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--lux-accent) 35%, transparent), transparent);
          transform: translateX(-120%);
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1;
        }

        .btn-diamond-shiny > * { position: relative; z-index: 2; }

        .btn-diamond-shiny:hover {
          transform: translateY(-2px);
          box-shadow: 0 28px 110px rgba(0,0,0,0.75);
        }

        .btn-diamond-shiny:hover::before {
          transform: translateX(120%);
        }
        
        .btn-outline-gold {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.85);
          padding: 18px 36px;
          border-radius: 0;
          text-decoration: none;
          font-size: 17px;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.14);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        
        .btn-outline-gold:hover {
          background: var(--lux-accent);
          color: oklch(0.06 0.005 280);
          transform: translateY(-2px);
          box-shadow: 0 18px 70px rgba(0,0,0,0.65);
          border-color: var(--lux-accent);
        }
        
        @media (max-width: 900px) {
          .partner-card {
            grid-template-columns: 1fr !important;
            width: calc(100% - 20px) !important;
            margin-left: 10px !important;
            margin-right: 10px !important;
            padding: 40px 30px !important;
            text-align: center;
          }
          
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          
          .card-header-flex {
            justify-content: center !important;
            flex-direction: column !important;
            text-align: center !important;
          }

          .elite-badge, .verified-badge {
            position: relative !important;
            top: 0 !important;
            right: 0 !important;
            margin: 0 auto 20px !important;
            width: fit-content !important;
          }
          
          .card-right-side {
            width: 100% !important;
            margin-top: 20px !important;
          }
        }
        
        @media (max-width: 600px) {
          .partner-card {
            width: calc(100% - 16px) !important;
            margin-left: 8px !important;
            margin-right: 8px !important;
            padding: 24px 16px !important;
            margin-bottom: 20px !important;
            border-radius: 16px !important;
          }
          
          .btn-gold, .btn-outline-gold, .btn-diamond-shiny {
            padding: 14px 24px !important;
            font-size: 14px !important;
            width: 100% !important;
            justify-content: center !important;
          }

          .card-right-side div[style*="fontSize: '46px'"] {
            font-size: 32px !important;
          }

          .card-right-side div[style*="padding: '35px 45px'"] {
            padding: 20px 25px !important;
          }

          .card-header-flex svg {
            width: 48px !important;
            height: 48px !important;
          }

          h2[style*="fontSize: 'clamp(32px, 5vw, 52px)'"] {
            font-size: 28px !important;
          }
        }

        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 10px 40px color-mix(in oklab, var(--lux-accent) 80%, transparent); }
          50% { transform: scale(1.05); box-shadow: 0 15px 60px color-mix(in oklab, var(--lux-accent) 100%, transparent); }
          100% { transform: scale(1); box-shadow: 0 10px 40px color-mix(in oklab, var(--lux-accent) 80%, transparent); }
        }

        @keyframes linearSweep {
          0% { transform: translateX(-100%) skewX(-25deg); }
          100% { transform: translateX(200%) skewX(-25deg); }
        }

        @keyframes ambientGlowPulse {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(1); }
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

