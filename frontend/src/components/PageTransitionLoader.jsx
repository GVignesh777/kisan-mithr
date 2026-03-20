import React, { useEffect, useRef } from 'react';
import logoImg from '../assets/logo.jpg';

/**
 * PageTransitionLoader
 * ─────────────────────────────────────────────────
 * A fast (800ms) overlay that plays between route
 * changes. Shows a pulsing KM logo on a white screen.
 *
 * Props:
 *   visible  – boolean: mount/unmount the overlay
 *   phase    – 'enter' | 'exit'  (controlled by parent)
 */
const PageTransitionLoader = ({ visible, phase }) => {
  const overlayRef = useRef(null);

  if (!visible) return null;

  const isEnter = phase === 'enter';

  return (
    <>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes kmSpinRing {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -502; }
        }
        @keyframes kmPulse {
          0%,  100% { transform: scale(1);    opacity: 1; }
          50%        { transform: scale(1.06); opacity: 0.88; }
        }
        @keyframes kmOrbitDot {
          from { transform: rotate(0deg)   translateX(62px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(62px) rotate(-360deg); }
        }
        @keyframes kmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes kmFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes kmGlowPulse {
          0%,  100% { opacity: 0.5; transform: scale(1); }
          50%        { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>

      {/* ── Full-screen overlay ── */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: isEnter
            ? 'kmFadeIn 0.18s ease-out forwards'
            : 'kmFadeOut 0.3s ease-in forwards',
          pointerEvents: 'all',
        }}
      >
        {/* Ambient background glow */}
        <div style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(90,173,47,0.18) 0%, transparent 70%)',
          filter: 'blur(28px)',
          animation: 'kmGlowPulse 1.6s ease-in-out infinite',
        }} />

        {/* ── Central logo container ── */}
        <div style={{ position: 'relative', width: 140, height: 140 }}>

          {/* Spinning SVG ring */}
          <svg
            viewBox="0 0 140 140"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
          >
            {/* Background ring (static, subtle) */}
            <circle
              cx="70" cy="70" r="62"
              fill="none"
              stroke="#e8f5e0"
              strokeWidth="3"
            />

            {/* Animated spinning arc */}
            <circle
              cx="70" cy="70" r="62"
              fill="none"
              stroke="url(#transGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="100 302"
              strokeDashoffset="0"
              style={{
                transformOrigin: '70px 70px',
                animation: 'kmSpinRing 1s linear infinite',
              }}
            />

            {/* Second trailing arc */}
            <circle
              cx="70" cy="70" r="62"
              fill="none"
              stroke="url(#transGrad2)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="40 362"
              strokeDashoffset="-120"
              style={{
                transformOrigin: '70px 70px',
                animation: 'kmSpinRing 1s linear infinite',
                opacity: 0.5,
              }}
            />

            {/* Orbit dot */}
            <g style={{
              transformOrigin: '70px 70px',
              animation: 'kmOrbitDot 1s linear infinite',
            }}>
              <circle cx="70" cy="8" r="4" fill="#5aad2f" />
            </g>

            <defs>
              <linearGradient id="transGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#2d6a0f" stopOpacity="0" />
                <stop offset="50%"  stopColor="#5aad2f" stopOpacity="1" />
                <stop offset="100%" stopColor="#2d6a0f" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="transGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#8dd45e" stopOpacity="0" />
                <stop offset="100%" stopColor="#8dd45e" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>

          {/* KM Logo image — pulsing */}
          <div style={{
            position: 'absolute',
            inset: 12,
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(45,106,15,0.25)',
            animation: 'kmPulse 1.6s ease-in-out infinite',
          }}>
            <img
              src={logoImg}
              alt="Kisan Mithr"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              draggable={false}
            />
            {/* Shimmer */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
          </div>
        </div>

        {/* Loading text */}
        <div style={{
          position: 'absolute',
          bottom: '36%',
          textAlign: 'center',
        }}>
          <p style={{
            color: '#4a7c29',
            fontSize: '0.65rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
            opacity: 0.7,
            animation: 'kmPulse 1.6s ease-in-out infinite',
          }}>
            Loading
          </p>
        </div>
      </div>
    </>
  );
};

export default PageTransitionLoader;
