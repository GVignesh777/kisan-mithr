import React, { useRef } from 'react';
import logoImg from '../assets/logo.jpg';

/**
 * PageTransitionLoader
 * ─────────────────────────────────────────────────
 * A premium, fast (800ms) overlay that plays between route
 * changes. Matches the modern dark SaaS aesthetic of the 
 * NetworkSplashScreen.
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
        @keyframes kmLoaderFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes kmLoaderFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes kmLoaderLogoEntrance {
          0%   { opacity: 0; transform: scale(0.9) translateY(10px); filter: blur(4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes kmLoaderPulseRing {
          0%   { transform: scale(1);    opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes kmLoaderBarShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes kmLoaderParticleFloat {
          0%,100% { transform: translateY(0); opacity: 0.1; }
          50%     { transform: translateY(-15px); opacity: 0.2; }
        }
      `}</style>

      {/* ── Full-screen overlay ── */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999, // Ensure it's above everything
          background: "linear-gradient(135deg, #0a0f0a 0%, #0d1f0d 40%, #091409 100%)",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: isEnter
            ? 'kmLoaderFadeIn 0.2s ease-out forwards'
            : 'kmLoaderFadeOut 0.3s ease-in forwards',
          pointerEvents: 'all',
          overflow: 'hidden',
        }}
      >
        {/* Ambient background particles (Mini version) */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
              width: 150 + i * 50,
              height: 150 + i * 50,
              top: `${(i * 25 + 10) % 80}%`,
              left: `${(i * 30 + 5) % 80}%`,
              animation: `kmLoaderParticleFloat ${4 + i}s ease-in-out infinite`,
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* ── Central content ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'kmLoaderLogoEntrance 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          {/* Logo with pulse rings */}
          <div style={{ position: "relative", marginBottom: 24 }}>
            {/* Pulse ring */}
            <div style={{
              position: "absolute", inset: -10, borderRadius: "50%",
              border: "2px solid rgba(34,197,94,0.3)",
              animation: "kmLoaderPulseRing 1.5s ease-out infinite",
            }} />
            
            <div style={{ borderRadius: "50%", padding: 2, background: 'rgba(34,197,94,0.2)' }}>
              <img
                src={logoImg}
                alt="Kisan Mithr"
                style={{
                  width: 80, height: 80,
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                  border: "2px solid rgba(34,197,94,0.4)",
                  boxShadow: "0 0 30px rgba(34,197,94,0.15)",
                }}
              />
            </div>
          </div>

          {/* Brand & Loading Info */}
          <h2 style={{
            fontSize: 18, fontWeight: 700, letterSpacing: "0.2em",
            background: "linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #16a34a 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0, marginBottom: 4,
          }}>
            KISAN MITHR
          </h2>
          
          <div style={{
            width: 120, height: 3, borderRadius: 99,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
            marginTop: 12,
            border: "1px solid rgba(34,197,94,0.1)",
          }}>
            <div
              style={{
                height: "100%",
                width: "60%", // Static visual for fast transition
                background: "linear-gradient(90deg, #15803d 0%, #22c55e 50%, #15803d 100%)",
                backgroundSize: "200% auto",
                animation: "kmLoaderBarShimmer 1.2s linear infinite",
                borderRadius: 99,
              }}
            />
          </div>

          <p style={{
            fontSize: 9, letterSpacing: "0.3em", color: "rgba(134,239,172,0.45)",
            textTransform: "uppercase", marginTop: 16, fontWeight: 600,
          }}>
            Loading...
          </p>
        </div>
      </div>
    </>
  );
};

export default PageTransitionLoader;
