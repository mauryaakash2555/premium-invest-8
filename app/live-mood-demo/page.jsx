'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * LIVE MOOD DEMO - "The Alpha Vault"
 * Bloomberg Terminal meets Apple Design
 * Huly.io inspired laser animation + Bento Grid
 * 
 * HULY EFFECT: WebGL-quality with Canvas + Perlin Noise
 */

// Huly.io inspired laser animation + Bento Grid (Combined CSS+Canvas Hybrid)

export default function LiveMoodDemo() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [hasSeenAnimation, setHasSeenAnimation] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showVerticalLaser, setShowVerticalLaser] = useState(false);
  const triggerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // High Fidelity CSS Styles from User
  const styles = `
  /* THE LASER BEAM CONTAINER - Overlay Mode */
  .laser-container {
    position: fixed;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: 200px;
    height: 100vh;
    z-index: 9997;
    pointer-events: none;
    opacity: 0;
    animation: fadeInLaser 1s ease-out forwards;
  }

  /* MAIN LASER BEAM */
  .laser-beam {
    position: absolute;
    width: 2px;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(255, 255, 255, 0.5) 10%,
      rgba(255, 255, 255, 1) 50%,
      rgba(255, 255, 255, 0.5) 90%,
      transparent 100%
    );
    box-shadow: 
      0 0 10px 2px rgba(100, 200, 255, 0.8),
      0 0 20px 4px rgba(60, 150, 255, 0.5),
      0 0 40px 10px rgba(30, 100, 255, 0.3),
      inset 0 0 10px rgba(255, 255, 255, 0.9);
  }

  /* OUTER GLOW LAYER 1 */
  .laser-glow-1 {
    position: absolute;
    width: 120px;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(100, 200, 255, 0.1) 40%,
      rgba(100, 200, 255, 0.2) 50%,
      rgba(100, 200, 255, 0.1) 60%,
      transparent 100%
    );
    filter: blur(20px);
    animation: laserPulse 3s ease-in-out infinite;
  }

  /* OUTER GLOW LAYER 2 */
  .laser-glow-2 {
    position: absolute;
    width: 300px;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(80, 150, 255, 0.05) 50%,
      transparent 100%
    );
    filter: blur(40px);
    animation: laserPulse 4s ease-in-out infinite 0.5s;
  }

  /* BOTTOM BLOOM */
  .laser-bloom {
    position: absolute;
    bottom: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 300px;
    background: radial-gradient(
      ellipse at center,
      rgba(60, 150, 255, 0.3) 0%,
      rgba(80, 200, 255, 0.1) 40%,
      transparent 70%
    );
    filter: blur(60px);
    animation: bloomPulse 3s ease-in-out infinite;
  }

  /* HORIZONTAL LIGHT STREAKS */
  .laser-streak {
    position: absolute;
    height: 2px;
    width: 100vw;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(
      90deg,
      transparent 30%,
      rgba(100, 200, 255, 0.4) 50%,
      transparent 70%
    );
    filter: blur(4px);
    opacity: 0;
    animation: scanDown 4s linear infinite;
  }

  .laser-streak:nth-child(5) { animation-delay: 0s; }
  .laser-streak:nth-child(6) { animation-delay: 1.5s; }
  .laser-streak:nth-child(7) { animation-delay: 2.8s; }
  .laser-streak:nth-child(8) { animation-delay: 3.2s; }

  @keyframes fadeInLaser { to { opacity: 1; }}

  @keyframes laserPulse {
    0%, 100% { opacity: 0.8; transform: translateX(-50%) scaleX(1); }
    50% { opacity: 1; transform: translateX(-50%) scaleX(1.1); }
  }

  @keyframes bloomPulse {
    0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
    50% { opacity: 0.9; transform: translateX(-50%) scale(1.2); }
  }
  
  @keyframes scanDown {
    0% { top: -10%; opacity: 0; }
    10% { opacity: 0.5; }
    90% { opacity: 0.5; }
    100% { top: 110%; opacity: 0; }
  }

  /* Grid overlay for depth */
  .laser-container::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-image: 
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(circle at center, black 0%, transparent 80%);
    pointer-events: none;
    z-index: -1;
  }
  `;

  // Check sessionStorage on mount
  useEffect(() => {
    const seen = sessionStorage.getItem('liveMoodAnimationSeen');
    if (seen) {
      setHasSeenAnimation(true);
    }
  }, []);

  // Removed renderHulyEffect (Canvas) in favor of CSS implementation
  useEffect(() => {
     // No canvas animation loop needed
  }, []);

  // Canvas noise texture for panel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isPanelOpen) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    // Generate noise
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;     // R
      data[i + 1] = noise; // G
      data[i + 2] = noise; // B
      data[i + 3] = 12;    // Alpha (very subtle)
    }

    ctx.putImageData(imageData, 0, 0);
  }, [isPanelOpen]);

  // Scroll trigger for first-time animation
  useEffect(() => {
    if (hasSeenAnimation) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasSeenAnimation && !isAnimating) {
            triggerAnimation();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [hasSeenAnimation, isAnimating]);

  // Trigger the Huly laser animation
  const triggerAnimation = () => {
    setIsAnimating(true);
    
    // Phase 1: Horizontal laser sweep (0-2s)
    // Phase 2: Vertical laser flows down (1.5s) - starts before horizontal ends
    setTimeout(() => {
      setShowVerticalLaser(true);
    }, 1500);
    
    // Phase 3: Panel opens (2.5s) - after vertical laser is visible
    setTimeout(() => {
      setIsPanelOpen(true);
      setIsAnimating(false);
      setHasSeenAnimation(true);
      sessionStorage.setItem('liveMoodAnimationSeen', 'true');
    }, 2500);
  };

  // Handle click on LIVE MOOD text
  const handleTextClick = () => {
    if (hasSeenAnimation && !isPanelOpen) {
      setIsAnimating(true);
      setShowVerticalLaser(true);
      setTimeout(() => {
        setIsPanelOpen(true);
        setIsAnimating(false);
      }, 1500);
    }
  };

  // Close panel on scroll down
  useEffect(() => {
    if (!isPanelOpen) return;

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY + 50) {
        setIsPanelOpen(false);
        setShowVerticalLaser(false); // Hide vertical laser when panel closes
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPanelOpen]);

  return (
    <div className="live-mood-demo">
      <style>{styles}</style>
      {/* Laser Animation Overlay - HORIZONTAL SWEEP (LOCKED ⭐) */}
      {isAnimating && (
        <div className="laser-overlay">
          <div className="laser-beam-horiz" />
          <div className="laser-glow-horiz" />
        </div>
      )}

      {/* HULY VERTICAL LASER - CSS Implementation */}
      {(showVerticalLaser || isPanelOpen) && (
         <div className="laser-container">
            <div className="laser-glow-2"></div>
            <div className="laser-glow-1"></div>
            <div className="laser-beam"></div>
            <div className="laser-bloom"></div>
            <div className="laser-streak"></div>
            <div className="laser-streak"></div>
            <div className="laser-streak"></div>
            <div className="laser-streak"></div>
         </div>
      )}

      {/* Alpha Vault Panel - "hangs" from the vertical laser */}
      {isPanelOpen && (
        <div className="alpha-vault-panel">
          {/* Noise Texture Canvas */}
          <canvas ref={canvasRef} className="noise-canvas" />
          
          {/* Radial Glows */}
          <div className="glow glow-1" />
          <div className="glow glow-2" />
          <div className="glow glow-3" />

          {/* Panel Content */}
          <div className="vault-content">
            <h2 className="vault-title">
              <span className="vault-icon">⚡</span>
              THE ALPHA VAULT
            </h2>
            <p className="vault-subtitle">Real-Time Market Intelligence</p>

            {/* Bento Grid */}
            <div className="bento-grid">
              {/* Share Market Card */}
              <div className="bento-card bento-large">
                <div className="card-header">
                  <span className="card-icon">📈</span>
                  <span className="card-label">SHARE MARKET</span>
                  <span className="card-badge live">LIVE</span>
                </div>
                <div className="card-value green">+1.24%</div>
                <div className="card-sublabel">NIFTY 50: 24,850.75</div>
              </div>

              {/* Mutual Funds Card */}
              <div className="bento-card">
                <div className="card-header">
                  <span className="card-icon">💰</span>
                  <span className="card-label">MUTUAL FUNDS</span>
                </div>
                <div className="card-value gold">₹2.4L Cr</div>
                <div className="card-sublabel">Today's Inflow</div>
              </div>

              {/* Breaking News Card */}
              <div className="bento-card bento-wide">
                <div className="card-header">
                  <span className="card-icon">⚡</span>
                  <span className="card-label">BREAKING NEWS</span>
                  <span className="card-badge urgent">URGENT</span>
                </div>
                <div className="card-news">
                  RBI holds repo rate at 6.5%, signals accommodative stance...
                </div>
              </div>

              {/* Insurance Card */}
              <div className="bento-card">
                <div className="card-header">
                  <span className="card-icon">🛡️</span>
                  <span className="card-label">INSURANCE</span>
                </div>
                <div className="card-value blue">+18%</div>
                <div className="card-sublabel">ULIP Growth YoY</div>
              </div>

              {/* FD/Bonds Card */}
              <div className="bento-card">
                <div className="card-header">
                  <span className="card-icon">🏦</span>
                  <span className="card-label">FD/BONDS</span>
                </div>
                <div className="card-value">8.5%</div>
                <div className="card-sublabel">Best FD Rate</div>
              </div>

              {/* PMS/AIF Card */}
              <div className="bento-card">
                <div className="card-header">
                  <span className="card-icon">👔</span>
                  <span className="card-label">PMS/AIF</span>
                </div>
                <div className="card-value purple">₹12,450 Cr</div>
                <div className="card-sublabel">AUM This Month</div>
              </div>

              {/* Real Estate Card */}
              <div className="bento-card">
                <div className="card-header">
                  <span className="card-icon">🏠</span>
                  <span className="card-label">REAL ESTATE</span>
                </div>
                <div className="card-value teal">+12%</div>
                <div className="card-sublabel">Mumbai Avg. Price</div>
              </div>

              {/* Forex/Gold Card */}
              <div className="bento-card bento-wide">
                <div className="card-header">
                  <span className="card-icon">🌍</span>
                  <span className="card-label">FOREX & GOLD</span>
                </div>
                <div className="forex-row">
                  <div className="forex-item">
                    <span className="forex-label">USD/INR</span>
                    <span className="forex-value">₹83.42</span>
                  </div>
                  <div className="forex-item">
                    <span className="forex-label">GOLD</span>
                    <span className="forex-value gold">₹78,450/10g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Close hint */}
            <p className="close-hint">↓ Scroll down to close</p>
          </div>
        </div>
      )}

      {/* Hero Section (Placeholder) */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>BM WEALTH</h1>
          <p>Your Trusted Financial Partner</p>
        </div>
      </section>

      {/* LIVE MOOD Trigger Section */}
      <section ref={triggerRef} className="live-mood-section">
        <div 
          className="live-mood-ticker"
          onClick={handleTextClick}
          style={{ cursor: hasSeenAnimation ? 'pointer' : 'default' }}
        >
          <span className="ticker-text">
            ⚡ LIVE MOOD • Market Intelligence • Real-Time Updates • Click to Explore ⚡
          </span>
        </div>
      </section>

      {/* More Content (for scrolling) */}
      <section className="content-section">
        <h2>Our Services</h2>
        <p>Scroll down to see more content...</p>
        <div style={{ height: '100vh' }} />
      </section>

      <style jsx>{`
        /* ========================================
           BASE STYLES
           ======================================== */
        .live-mood-demo {
          min-height: 300vh;
          background: #0A0A0A;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* ========================================
           HULY CANVAS (Exact Replica)
           ======================================== */
        .huly-canvas {
          opacity: 0;
          animation: canvasFadeIn 0.5s ease-out forwards;
        }

        @keyframes canvasFadeIn {
          to { opacity: 1; }
        }

        /* ========================================
           LASER ANIMATION (LOCKED ⭐)
           ======================================== */
        .laser-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
          pointer-events: none;
          background: rgba(10, 10, 10, 0.95);
        }

        .laser-beam-horiz {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(81, 144, 236, 0.3) 20%,
            rgba(81, 144, 236, 0.8) 40%,
            #fff 50%,
            rgba(81, 144, 236, 0.8) 60%,
            rgba(81, 144, 236, 0.3) 80%,
            transparent 100%
          );
          transform: translateY(-50%);
          animation: laserSweep 2s ease-out forwards;
          box-shadow: 
            0 0 20px rgba(81, 144, 236, 0.8),
            0 0 40px rgba(81, 144, 236, 0.6),
            0 0 60px rgba(81, 144, 236, 0.4);
        }

        .laser-glow-horiz {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          background: radial-gradient(
            circle,
            rgba(81, 144, 236, 0.4) 0%,
            transparent 70%
          );
          transform: translate(-50%, -50%);
          animation: glowPulse 2s ease-out forwards;
        }

        @keyframes laserSweep {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 1;
          }
          50% {
            clip-path: inset(0 0 0 0);
            opacity: 1;
          }
          100% {
            clip-path: inset(0 0 0 0);
            opacity: 0;
          }
        }

        @keyframes glowPulse {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        /* ========================================
           HULY VERTICAL LASER - CSS Implementation
           ======================================== */
        @keyframes connectionPulse {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }

        /* ========================================
           ALPHA VAULT PANEL - Hangs from vertical laser
           ======================================== */
        .alpha-vault-panel {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9998;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          overflow-y: auto;
          animation: panelDescend 0.8s ease-out forwards;
        }

        /* Panel descends from where the laser connects */
        @keyframes panelDescend {
          0% {
            opacity: 0;
            transform: translateY(-60px);
            clip-path: inset(0 0 100% 0);
          }
          40% {
            opacity: 0.5;
            clip-path: inset(0 0 60% 0);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            clip-path: inset(0 0 0 0);
          }
        }

        .noise-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.04;
          mix-blend-mode: overlay;
        }

        /* ========================================
           RADIAL GLOWS (Northern Lights)
           ======================================== */
        .glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
        }

        .glow-1 {
          top: -10%;
          left: 20%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(81, 144, 236, 0.3) 0%, transparent 70%);
        }

        .glow-2 {
          top: 30%;
          right: -5%;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(244, 119, 88, 0.25) 0%, transparent 70%);
        }

        .glow-3 {
          bottom: 10%;
          left: 10%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(49, 61, 154, 0.4) 0%, transparent 70%);
        }

        /* ========================================
           VAULT CONTENT
           ======================================== */
        .vault-content {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .vault-title {
          font-size: clamp(24px, 5vw, 42px);
          font-weight: 700;
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #fff 0%, #5190EC 50%, #F47758 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .vault-icon {
          margin-right: 12px;
        }

        .vault-subtitle {
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 40px;
        }

        /* ========================================
           BENTO GRID
           ======================================== */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
        }

        .bento-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .bento-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .bento-large {
          grid-column: span 2;
          grid-row: span 2;
        }

        .bento-wide {
          grid-column: span 2;
        }

        @media (max-width: 600px) {
          .bento-large,
          .bento-wide {
            grid-column: span 1;
            grid-row: span 1;
          }
        }

        /* ========================================
           CARD CONTENT
           ======================================== */
        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .card-icon {
          font-size: 20px;
        }

        .card-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.7);
        }

        .card-badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }

        .card-badge.live {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          animation: pulse 2s infinite;
        }

        .card-badge.urgent {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .card-value {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 700;
          margin-bottom: 8px;
        }

        .card-value.green { color: #22c55e; }
        .card-value.gold { color: #C0A062; }
        .card-value.blue { color: #5190EC; }
        .card-value.purple { color: #a855f7; }
        .card-value.teal { color: #14b8a6; }

        .card-sublabel {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
        }

        .card-news {
          font-size: 15px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.85);
        }

        /* ========================================
           FOREX ROW
           ======================================== */
        .forex-row {
          display: flex;
          gap: 24px;
        }

        .forex-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .forex-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .forex-value {
          font-size: 24px;
          font-weight: 600;
        }

        .forex-value.gold {
          color: #C0A062;
        }

        /* ========================================
           CLOSE HINT
           ======================================== */
        .close-hint {
          text-align: center;
          margin-top: 40px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 14px;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }

        /* ========================================
           HERO SECTION (Placeholder)
           ======================================== */
        .hero-section {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #0A0A0A 0%, #131925 100%);
        }

        .hero-content {
          text-align: center;
        }

        .hero-content h1 {
          font-size: clamp(36px, 8vw, 72px);
          font-weight: 700;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #C0A062 0%, #E8D5A3 50%, #C0A062 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-content p {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.6);
        }

        /* ========================================
           LIVE MOOD SECTION (Trigger)
           ======================================== */
        .live-mood-section {
          padding: 20px 0;
          background: linear-gradient(90deg, #131925 0%, #19202E 50%, #131925 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .live-mood-ticker {
          display: flex;
          overflow: hidden;
          padding: 12px 0;
        }

        .ticker-text {
          white-space: nowrap;
          animation: tickerScroll 20s linear infinite;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 2px;
          color: #5190EC;
        }

        @keyframes tickerScroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .live-mood-ticker:hover .ticker-text {
          animation-play-state: paused;
          color: #F47758;
        }

        /* ========================================
           CONTENT SECTION
           ======================================== */
        .content-section {
          padding: 60px 20px;
          text-align: center;
        }

        .content-section h2 {
          font-size: 32px;
          margin-bottom: 16px;
        }

        .content-section p {
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
    </div>
  );
}
