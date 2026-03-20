import React, { useState, useEffect, useRef } from 'react';
import logoImg from '../assets/logo.jpg';

/* ─────────────────────────────────────────────
   ANIMATED LOGO – core inner piece
───────────────────────────────────────────── */
const AnimatedLogo = ({ animationState }) => {
  const imgRef = useRef(null);
  const glowRef = useRef(null);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 260, height: 260 }}
    >

      {/* ── Layer 1: SVG Leaf-draw ring ─────────────────── */}
      <svg
        viewBox="0 0 260 260"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Outer decorative circle (stroke-dash draw effect) */}
        <circle
          cx="130"
          cy="130"
          r="118"
          fill="none"
          stroke="url(#leafGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="741.4"
          strokeDashoffset="741.4"
          style={{
            animation: animationState >= 1
              ? 'leafDraw 1.2s cubic-bezier(0.25,0.46,0.45,0.94) 0.1s forwards'
              : 'none',
          }}
        />

        {/* Inner accent circle */}
        <circle
          cx="130"
          cy="130"
          r="108"
          fill="none"
          stroke="url(#leafGradient2)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="678.6"
          strokeDashoffset="678.6"
          style={{
            animation: animationState >= 1
              ? 'leafDraw 1.2s cubic-bezier(0.25,0.46,0.45,0.94) 0.35s forwards'
              : 'none',
          }}
        />

        {/* Small decorative leaf arcs at top and bottom */}
        <path
          d="M 60 50 Q 130 20 200 50"
          fill="none"
          stroke="#4a7c29"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="160"
          strokeDashoffset="160"
          style={{
            animation: animationState >= 1
              ? 'leafDraw 0.9s ease-out 0.7s forwards'
              : 'none',
          }}
        />
        <path
          d="M 60 210 Q 130 240 200 210"
          fill="none"
          stroke="#4a7c29"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="160"
          strokeDashoffset="160"
          style={{
            animation: animationState >= 1
              ? 'leafDraw 0.9s ease-out 0.9s forwards'
              : 'none',
          }}
        />

        {/* Corner sparkle dots */}
        {[
          { cx: 130, cy: 12,  delay: '1.1s' },
          { cx: 248, cy: 130, delay: '1.2s' },
          { cx: 130, cy: 248, delay: '1.3s' },
          { cx: 12,  cy: 130, delay: '1.4s' },
        ].map(({ cx, cy, delay }, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="3.5"
            fill="#5a9e32"
            opacity="0"
            style={{
              animation: animationState >= 1
                ? `dotFade 0.4s ease-out ${delay} forwards`
                : 'none',
            }}
          />
        ))}

        <defs>
          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#2d6a0f" />
            <stop offset="50%"  stopColor="#5aad2f" />
            <stop offset="100%" stopColor="#2d6a0f" />
          </linearGradient>
          <linearGradient id="leafGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#3a8c18" />
            <stop offset="100%" stopColor="#8dd45e" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Layer 2: Glow halo ──────────────────────────── */}
      <div
        ref={glowRef}
        className="absolute rounded-full"
        style={{
          width: 220,
          height: 220,
          background: 'radial-gradient(circle, rgba(90,173,47,0.35) 0%, rgba(90,173,47,0.12) 45%, transparent 70%)',
          filter: 'blur(18px)',
          opacity: 0,
          animation: animationState >= 2
            ? 'softGlow 0.9s ease-out 0s forwards'
            : 'none',
        }}
      />

      {/* ── Layer 3: Logo image ─────────────────────────── */}
      <div
        className="relative rounded-full overflow-hidden shadow-2xl"
        style={{
          width: 200,
          height: 200,
          opacity: 0,
          animation: animationState >= 3
            ? 'logoFadeScale 0.7s cubic-bezier(0.34,1.56,0.64,1) 0s forwards'
            : 'none',
        }}
      >
        {/* Soft blur entrance */}
        <div
          className="absolute inset-0 rounded-full bg-white"
          style={{
            zIndex: 1,
            opacity: 0,
            animation: animationState >= 3
              ? 'blurEntrance 0.7s ease-out 0s forwards'
              : 'none',
          }}
        />

        <img
          ref={imgRef}
          src={logoImg}
          alt="Kisan Mithr Logo"
          className="w-full h-full object-cover"
          draggable={false}
          style={{ position: 'relative', zIndex: 2 }}
        />

        {/* Subtle shimmer overlay */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            zIndex: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(255,255,255,0.06) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── Layer 4: Float ring (infinite) ──────────────── */}
      {animationState >= 4 && (
        <div
          className="absolute rounded-full border border-green-400/20"
          style={{
            width: 240,
            height: 240,
            animation: 'leafFloat 6s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   LOGO ANIMATION CONTAINER
───────────────────────────────────────────── */
const LogoAnimationContainer = ({ onComplete }) => {
  const containerRef = useRef(null);
  const [animationState, setAnimationState] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    // Stagger the animation stages
    const t0 = setTimeout(() => setAnimationState(1), 100);   // leaf draw starts
    const t1 = setTimeout(() => setAnimationState(2), 1400);  // glow
    const t2 = setTimeout(() => setAnimationState(3), 1700);  // logo fade-scale
    const t3 = setTimeout(() => setAnimationState(4), 2500);  // float loop
    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => [t0, t1, t2, t3, t4].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center select-none"
      style={{
        transform: hover
          ? 'perspective(800px) rotateX(2deg) rotateY(-2deg) scale(1.03)'
          : 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1)',
        cursor: 'default',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Outer glow shadow while hovering */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(74,124,41,0.22) 0%, transparent 70%)',
          filter: 'blur(24px)',
          opacity: hover ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      <AnimatedLogo animationState={animationState} />

      {/* Brand text beneath logo */}
      <div
        className="mt-6 text-center"
        style={{
          opacity: 0,
          animation: animationState >= 3
            ? 'logoFadeScale 0.8s ease-out 0.4s forwards'
            : 'none',
        }}
      >
        <h1
          className="text-3xl font-bold tracking-widest"
          style={{ color: '#1e5c0a', letterSpacing: '0.22em', fontFamily: "'Playfair Display', serif" }}
        >
          KISAN MITHR
        </h1>
        <p
          className="mt-1 text-sm tracking-[0.3em] text-green-600/70 uppercase"
          style={{ fontFamily: 'sans-serif' }}
        >
          Smart Farming Platform
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN EXPORTED COMPONENT
───────────────────────────────────────────── */
const KisanMithrLogoAnimation = ({ onComplete }) => {
  return (
    <>
      {/* Inject keyframes into a style tag */}
      <style>{`
        /* ── Leaf ring draw ── */
        @keyframes leafDraw {
          to { stroke-dashoffset: 0; }
        }

        /* ── Sparkle dot appear ── */
        @keyframes dotFade {
          0%   { opacity: 0; transform: scale(0.5); }
          60%  { opacity: 1; transform: scale(1.4); }
          100% { opacity: 0.8; transform: scale(1); }
        }

        /* ── Glow pulse ── */
        @keyframes softGlow {
          0%   { opacity: 0; transform: scale(0.6); }
          50%  { opacity: 1; transform: scale(1.15); }
          100% { opacity: 0.7; transform: scale(1); }
        }

        /* ── Logo fade + scale with spring ── */
        @keyframes logoFadeScale {
          0%   { opacity: 0; transform: scale(0.88); filter: blur(8px); }
          60%  { opacity: 1; filter: blur(0px); }
          80%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }

        /* ── Blur entrance overlay ── */
        @keyframes blurEntrance {
          0%   { opacity: 0.6; }
          100% { opacity: 0; }
        }

        /* ── Leaf float ── */
        @keyframes leafFloat {
          0%,  100% { transform: translateY(0px)   rotate(0deg); }
          25%        { transform: translateY(-6px)  rotate(0.5deg); }
          75%        { transform: translateY(6px)   rotate(-0.5deg); }
        }

        /* ── Page background fade-out (used by parent) ── */
        @keyframes pageFadeOut {
          0%   { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
      `}</style>

      {/* Full-screen centered white backdrop */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Background particle dots for ambience */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-green-400/10"
              style={{
                width:  Math.random() * 120 + 40,
                height: Math.random() * 120 + 40,
                top:    `${Math.random() * 100}%`,
                left:   `${Math.random() * 100}%`,
                filter: 'blur(30px)',
                animation: `leafFloat ${4 + Math.random() * 6}s ease-in-out ${Math.random() * 3}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Actual logo animation */}
        <LogoAnimationContainer onComplete={onComplete} />
      </div>
    </>
  );
};

export default KisanMithrLogoAnimation;
