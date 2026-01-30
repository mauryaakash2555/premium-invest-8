'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';

const DEFAULT_SCENE_URL = '/spline/genkub/scene.splinecode';

const FONT_URL_REWRITES = new Map([
  [
    'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf',
    '/spline/r4x/fonts/Roboto_700.ttf',
  ],
  [
    'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
    '/spline/r4x/fonts/Roboto_regular.ttf',
  ],
]);

function rewriteExternalAssetUrl(url) {
  if (!url) return null;
  if (FONT_URL_REWRITES.has(url)) return FONT_URL_REWRITES.get(url);
  return null;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(Boolean(media.matches));
    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return reduced;
}

function useIsMobileFloat() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(Boolean(media.matches));
    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return isMobile;
}

function stripSplineBackground(app) {
  try {
    if (!app) return;

    // 1) Force transparent background color again (scene load may have overwritten it)
    try {
      app.setBackgroundColor('rgba(0,0,0,0)');
      app.setBackgroundColor('transparent');
    } catch {}

    // 2) Try to access internal Three.js renderer and force alpha clear
    try {
      const renderer =
        app._renderer ||
        app.renderer ||
        app.__renderer ||
        app._scene?.renderer ||
        app.spline?.renderer;
      if (renderer) {
        if (typeof renderer.setClearColor === 'function') {
          renderer.setClearColor(0x000000, 0);
        }
        if (typeof renderer.setClearAlpha === 'function') {
          renderer.setClearAlpha(0);
        }
        // Some Three.js versions use this
        if (renderer.autoClear !== undefined) {
          renderer.autoClearColor = true;
        }
      }
    } catch {}

    // 2b) Clear internal Three.js scene background/environment if exposed
    // (some scenes render a room/cube-map that looks like a "box" even with transparent canvas)
    try {
      const threeScene =
        app._scene?.scene ||
        app._scene?._scene ||
        app._scene?.threeScene ||
        app.spline?._scene?.scene ||
        app.spline?.scene;

      if (threeScene) {
        if (threeScene.background) threeScene.background = null;
        if (threeScene.environment) threeScene.environment = null;
      }
    } catch {}

    // 3) Hide floor/background/stage objects
    if (typeof app.getAllObjects !== 'function') return;
    const objects = app.getAllObjects() || [];

    // Explicit object names to always hide (from the scene hierarchy)
    const exactHide = ['floor', 'Floor', 'ground', 'Ground', 'Plane', 'plane'];

    // Pattern-based hiding for other stage objects
    const hideName =
      /(^floor$|^ground$|^plane$|wall|background|backdrop|stage|room|environment|shadow.*plane|shadow.*catcher|reflection|box|cube|cage|glass|frame|panel|window|container)/i;
    const isAlwaysSkip = /(light|camera)/i;
    const isBotLike = /(robot|bot|avatar|character|rig|root)/i;

    for (const obj of objects) {
      if (!obj) continue;
      const name = obj.name || '';

      // Hide if exact match or pattern match
      const shouldHide = exactHide.includes(name) || hideName.test(name);
      if (!shouldHide) continue;

      // Always skip lights/cameras.
      if (isAlwaysSkip.test(name)) continue;

      // Skip hiding the bot itself unless it clearly looks like stage/room/etc.
      if (isBotLike.test(name) && !hideName.test(name)) continue;

      try {
        if (typeof obj.hide === 'function') {
          obj.hide();
        } else {
          obj.visible = false;
        }
      } catch {}
    }

    // 4) Also try to find and hide by searching for specific names
    const namesToHide = ['Floor', 'floor', 'Ground', 'Plane', 'Room', 'room', 'Box', 'box', 'Cage', 'cage'];
    for (const n of namesToHide) {
      try {
        const found = app.findObjectByName?.(n);
        if (found) {
          if (typeof found.hide === 'function') found.hide();
          else found.visible = false;
        }
      } catch {}
    }
  } catch {}
}

function fixSplineBotPosture(app) {
  try {
    if (!app || typeof app.getAllObjects !== 'function') return;

    const objects = app.getAllObjects() || [];
    if (!objects.length) return;

    const botRe = /(robot|bot|avatar|character|rig|root)/i;
    const rejectRe = /(light|camera|target|cursor|message|floor|ground|plane|stage|room|environment|shadow|reflection)/i;

    // Prefer an explicit bot/robot/rig root if present (but avoid helper targets).
    const preferred = objects.find((o) => botRe.test(o?.name || '') && !rejectRe.test(o?.name || ''));
    const candidate = preferred;

    if (!candidate) return;

    // If the model looks "sleeping" it is usually rotated on X or Z.
    // Snap only when it's clearly not upright.
    const r = candidate.rotation;
    if (!r || typeof r.x !== 'number' || typeof r.y !== 'number' || typeof r.z !== 'number') return;

    const abs = (v) => Math.abs(v);
    const shouldUprightX = abs(r.x) > 0.25;
    const shouldUprightZ = abs(r.z) > 0.25;

    if (shouldUprightX) {
      try {
        candidate.rotation.x = 0;
      } catch {}
    }

    if (shouldUprightZ) {
      try {
        candidate.rotation.z = 0;
      } catch {}
    }

    // Nudge up slightly if the character intersects an invisible floor after removing it.
    try {
      const p = candidate.position;
      if (p && typeof p.y === 'number') {
        if (p.y < -0.2) candidate.position.y = 0;
      }
    } catch {}
  } catch {}
}

function wakeSplineInteractions(canvas) {
  try {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : 0;
    const y = rect ? rect.top + rect.height / 2 : 0;

    const mk = (type) =>
      new PointerEvent(type, {
        bubbles: true,
        cancelable: false,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
        clientX: x,
        clientY: y,
      });

    if (typeof PointerEvent !== 'undefined') {
      canvas.dispatchEvent(mk('pointerover'));
      canvas.dispatchEvent(mk('pointerenter'));
      canvas.dispatchEvent(mk('pointermove'));
      return;
    }

    canvas.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: false,
        clientX: x,
        clientY: y,
      })
    );
  } catch {}
}

export default function Chatbot3DTrigger({
  onActivate,
  sceneUrl = DEFAULT_SCENE_URL,
  size = 200,
  zIndex = 2000,
  className,
  style,
  'aria-label': ariaLabel = 'Open chat',
  ...rest
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const originalFetchRef = useRef(null);
  const moveMetaRef = useRef({ pointerType: 'mouse', pointerId: 1, buttons: 0 });
  const cursorRef = useRef({ x: 0, y: 0, has: false });
  const animRef = useRef({ raf: 0, x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobileFloat = useIsMobileFloat();

  const resolvedSizePx = useMemo(() => {
    if (isMobileFloat) {
      const base = typeof size === 'number' && Number.isFinite(size) ? size : 200;
      // Mobile: slightly smaller so it doesn't cover nav/CTAs.
      return Math.max(140, Math.min(170, Math.round(base * 0.82)));
    }
    return Math.max(180, Math.min(220, size));
  }, [isMobileFloat, size]);

  const containerStyle = useMemo(
    () => ({
      position: 'fixed',
      // Mobile: sit at the screen edge, but keep clear of the luxury bottom dock.
      bottom: isMobileFloat ? 'calc(var(--li-mobile-dock-clearance, 72px) + env(safe-area-inset-bottom))' : '50px',
      right: isMobileFloat ? 'calc(env(safe-area-inset-right) + 0px)' : '50px',
      width: `${resolvedSizePx}px`,
      height: `${resolvedSizePx}px`,
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      animation: 'none',
      filter: 'none',
      color: 'transparent',
      cursor: 'pointer',
      zIndex,
      pointerEvents: 'auto',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
      outline: 'none',
      ...style,
    }),
    [isMobileFloat, resolvedSizePx, style, zIndex]
  );

  // Track cursor globally (whole page), not just over the canvas.
  useEffect(() => {
    if (prefersReducedMotion) return;

    // On mobile/touch-first devices, feeding global cursor events doesn't help much
    // and can be expensive. The bot still reacts to direct interaction on the canvas.
    if (isMobileFloat) return;

    let raf = 0;

    const onMove = (e) => {
      cursorRef.current = { x: e.clientX, y: e.clientY, has: true };

       moveMetaRef.current = {
         pointerType: e.pointerType || 'mouse',
         pointerId: typeof e.pointerId === 'number' ? e.pointerId : 1,
         buttons: typeof e.buttons === 'number' ? e.buttons : 0,
       };

      // Feed the Spline canvas synthetic move events so it can react anywhere.
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Throttle synthetic dispatch to at most once per animation frame.
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const c = canvasRef.current;
        if (!c) return;
        if (!appRef.current) return;

        const { x, y } = cursorRef.current;
        const meta = moveMetaRef.current;

        try {
          if (typeof PointerEvent !== 'undefined') {
            c.dispatchEvent(
              new PointerEvent('pointermove', {
                bubbles: true,
                cancelable: false,
                pointerId: meta.pointerId,
                pointerType: meta.pointerType,
                isPrimary: true,
                buttons: meta.buttons,
                clientX: x,
                clientY: y,
              })
            );
            return;
          }
        } catch {}

        // Fallback for environments without PointerEvent.
        try {
          c.dispatchEvent(
            new MouseEvent('mousemove', {
              bubbles: true,
              cancelable: false,
              clientX: x,
              clientY: y,
            })
          );
        } catch {}
      });
    };

    // Use *one* global listener. Adding both can double-fire in many browsers.
    const supportsPointer = typeof window !== 'undefined' && 'PointerEvent' in window;
    const eventName = supportsPointer ? 'pointermove' : 'mousemove';
    window.addEventListener(eventName, onMove, { passive: true });

    return () => {
      try {
        if (raf) cancelAnimationFrame(raf);
      } catch {}
      window.removeEventListener(eventName, onMove);
    };
  }, [isMobileFloat, prefersReducedMotion]);

  // Smooth "magnetic" floating motion (like the Spline community demo).
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!containerRef.current) return;

    const el = containerRef.current;
    let mounted = true;

    const step = () => {
      if (!mounted) return;
      const { x, y, has } = cursorRef.current;

      // No cursor info yet (e.g., initial load)
      if (!has) {
        animRef.current.raf = requestAnimationFrame(step);
        return;
      }

      // Map cursor position to a subtle offset. Keep it near bottom-right.
      const nx = Math.max(0, Math.min(1, x / Math.max(1, window.innerWidth)));
      const ny = Math.max(0, Math.min(1, y / Math.max(1, window.innerHeight)));

      // Move left as cursor goes left; stay near right edge when cursor is right.
      const targetX = (nx - 1) * (isMobileFloat ? 90 : 140);
      // Small vertical drift
      const targetY = (ny - 0.75) * (isMobileFloat ? 18 : 24);

      const state = animRef.current;
      state.x += (targetX - state.x) * 0.12;
      state.y += (targetY - state.y) * 0.12;

      el.style.transform = `translate3d(${state.x.toFixed(1)}px, ${state.y.toFixed(1)}px, 0)`;

      state.raf = requestAnimationFrame(step);
    };

    animRef.current.raf = requestAnimationFrame(step);

    return () => {
      mounted = false;
      try {
        cancelAnimationFrame(animRef.current.raf);
      } catch {}
      try {
        el.style.transform = 'translate3d(0px, 0px, 0)';
      } catch {}
    };
  }, [isMobileFloat, prefersReducedMotion] );

  // Initialize ASAP (user expectation: bot appears immediately).
  useEffect(() => {
    if (prefersReducedMotion) return;
    setReady(true);
  }, [prefersReducedMotion]);

  // Initialize Spline runtime.
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!ready) return;
    if (!canvasRef.current) return;
    if (appRef.current) return;

    let cancelled = false;

    // Prevent any external network calls for known embedded assets (e.g., fonts).
    // Keep this narrowly scoped to a small allow-list.
    // NOTE: window.fetch must be called with the correct `this` binding (Window) or
    // browsers can throw: "Failed to execute 'fetch' on 'Window': Illegal invocation".
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      if (!originalFetchRef.current) {
        const originalFetchRaw = window.fetch;
        const originalFetchBound = window.fetch.bind(window);
        originalFetchRef.current = originalFetchRaw;

        window.fetch = async (input, init) => {
          try {
            const url =
              typeof input === 'string'
                ? input
                : input instanceof Request
                  ? input.url
                  : input && typeof input.url === 'string'
                    ? input.url
                    : null;

            const rewritten = rewriteExternalAssetUrl(url);
            if (rewritten) {
              if (typeof input === 'string') {
                return originalFetchBound(rewritten, init);
              }

              if (input instanceof Request) {
                // Avoid cloning bodies/streams. Our rewritten URLs are GET/HEAD font files.
                if (input.method && input.method !== 'GET' && input.method !== 'HEAD') {
                  return originalFetchBound(input, init);
                }

                const reqInit = {
                  method: input.method,
                  headers: input.headers,
                  mode: input.mode,
                  credentials: input.credentials,
                  cache: input.cache,
                  redirect: input.redirect,
                  referrer: input.referrer,
                  referrerPolicy: input.referrerPolicy,
                  integrity: input.integrity,
                  keepalive: input.keepalive,
                  signal: input.signal,
                  ...(init || {}),
                };

                return originalFetchBound(new Request(rewritten, reqInit));
              }

              return originalFetchBound(rewritten, init);
            }
          } catch {}

          return originalFetchBound(input, init);
        };
      }
    }

    (async () => {
      try {
        const mod = await import('@splinetool/runtime');
        if (cancelled) return;

        const app = new mod.Application(canvasRef.current, {
          renderMode: 'auto',
        });
        appRef.current = app;

        // Keep background transparent (prevents the "white box").
        // 1) Spline API background
        try {
          app.setBackgroundColor('rgba(0,0,0,0)');
        } catch {}

        // 2) WebGL clear color alpha = 0 (some scenes still clear to opaque white otherwise)
        try {
          const renderer = app?._renderer || app?.renderer || app?.__renderer;
          if (renderer?.setClearColor) renderer.setClearColor(0x000000, 0);
          if (renderer?.setClearAlpha) renderer.setClearAlpha(0);
        } catch {}

        // 3) Canvas CSS background
        try {
          canvasRef.current.style.background = 'transparent';
        } catch {}

        // Ensure correct size.
        try {
          const rect = canvasRef.current.getBoundingClientRect();
          app.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
        } catch {}

        await app.load(sceneUrl);
        if (cancelled) return;

        // Try to remove floor/background geometry so the bot isn't "boxed in".
        stripSplineBackground(app);

        // Try to fix common "sleeping/sideways" pose issues from scene transforms.
        fixSplineBotPosture(app);

        // Some Spline interactions/animations only activate after a hover/enter.
        // Trigger a synthetic enter + initial move so it wakes up.
        try {
          wakeSplineInteractions(canvasRef.current);
        } catch {}

        // Re-apply transparent background after load (scene settings may override)
        try {
          app.setBackgroundColor('rgba(0,0,0,0)');
        } catch {}
        try {
          canvasRef.current.style.background = 'transparent';
        } catch {}

        // Ensure animation/timeline is running after load.
        try {
          app.play?.();
        } catch {}

        // Some scenes create stage/room meshes late; strip again after a short delay.
        try {
          setTimeout(() => {
            try {
              if (appRef.current) {
                stripSplineBackground(appRef.current);
                fixSplineBotPosture(appRef.current);
              }
            } catch {}
          }, 350);
        } catch {}

        // Debug: log all object names when ?__splineDebug=1 is in URL
        if (typeof window !== 'undefined' && window.location?.search?.includes('__splineDebug')) {
          try {
            const allObjs = app.getAllObjects?.() || [];
            console.log('[Spline Debug] All objects:', allObjs.map((o) => ({ name: o.name, visible: o.visible })));
          } catch {}
        }

        setLoaded(true);

        // Pause when tab is hidden.
        const onVisibility = () => {
          if (!appRef.current) return;
          if (document.visibilityState === 'hidden') {
            try {
              appRef.current.stop();
            } catch {}
          } else {
            try {
              appRef.current.play();
            } catch {}
          }
        };

        document.addEventListener('visibilitychange', onVisibility);

        // Resize to stay crisp.
        const onResize = () => {
          if (!canvasRef.current || !appRef.current) return;
          try {
            const r = canvasRef.current.getBoundingClientRect();
            appRef.current.setSize(Math.max(1, r.width), Math.max(1, r.height));
          } catch {}
        };
        window.addEventListener('resize', onResize);

        // Initial visibility sync.
        onVisibility();

        return () => {
          document.removeEventListener('visibilitychange', onVisibility);
          window.removeEventListener('resize', onResize);
        };
      } catch (e) {
        console.error('Failed to load Spline runtime scene:', e);
      }
    })();

    return () => {
      cancelled = true;
      try {
        appRef.current?.dispose?.();
      } catch {}
      appRef.current = null;

      // Restore fetch if we wrapped it.
      try {
        if (originalFetchRef.current && typeof window !== 'undefined') {
          window.fetch = originalFetchRef.current;
        }
      } catch {}
      originalFetchRef.current = null;
    };
  }, [prefersReducedMotion, ready, sceneUrl]);

  const handlePointerUp = useCallback(
    (e) => {
      // Let Spline's internal click/tap reactions run first.
      // React's handler is delegated; a 0ms delay prevents stealing the interaction.
      if (typeof onActivate !== 'function') return;

      // Only respond to primary mouse button, but allow touch.
      if (e.pointerType === 'mouse' && e.button != null && e.button !== 0) return;

      setTimeout(() => {
        try {
          onActivate();
        } catch {}
      }, 0);
    },
    [onActivate]
  );

  // Reduced-motion fallback: keep a simple button (no 3D).
  if (prefersReducedMotion) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => onActivate?.()}
        className={className}
        style={{
          ...containerStyle,
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          background: 'rgba(0,0,0,0.55)',
          color: 'var(--lux-accent)',
          boxShadow:
            '0 26px 90px rgba(0, 0, 0, 0.80), 0 0 0 1px rgba(255, 255, 255, 0.08) inset, 0 0 0 1px color-mix(in oklab, var(--lux-accent) 16%, transparent)',
        }}
        {...rest}
      >
        <MessageCircle size={28} style={{ width: '28px', height: '28px' }} />
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={className}
      style={containerStyle}
      onPointerUp={handlePointerUp}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate?.();
        }
      }}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: 'transparent',
        }}
      />

      {!loaded && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--lux-accent)',
            pointerEvents: 'none',
          }}
        >
          <MessageCircle size={28} style={{ width: '28px', height: '28px', opacity: 0.8 }} />
        </div>
      )}
    </div>
  );
}
