import React, { useState, useEffect, useRef, useCallback } from "react";
import logoImg from "../assets/logo.jpg";

/* ─────────────────────────────────────────────
   Utility: measure real download speed using a
   tiny payload fetched from the network.
   Returns speed in Mbps, or null if offline.
───────────────────────────────────────────── */
const measureNetworkSpeed = async () => {
  try {
    // Use a cache-busted small image (4KB) to estimate speed
    const bytes = 4096;
    const url = `https://www.google.com/favicon.ico?_=${Date.now()}`;
    const start = performance.now();
    const res = await fetch(url, { mode: "no-cors", cache: "no-store" });
    const end = performance.now();
    const durationSec = (end - start) / 1000;
    // Estimate: ~ 4KB / duration; return in Mbps
    const speedMbps = (bytes * 8) / (durationSec * 1_000_000);
    return Math.min(speedMbps, 100); // cap at 100 Mbps for display
  } catch {
    return null;
  }
};

/* Speed label helper */
const getSpeedLabel = (mbps) => {
  if (mbps === null) return { label: "No Connection", color: "#ef4444", emoji: "📵" };
  if (mbps < 0.5)   return { label: "Very Slow Network", color: "#f97316", emoji: "🐌" };
  if (mbps < 2)     return { label: "Slow Network", color: "#eab308", emoji: "⚠️" };
  if (mbps < 10)    return { label: "Good Connection", color: "#22c55e", emoji: "📶" };
  return             { label: "Fast Connection", color: "#4ade80", emoji: "🚀" };
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const NetworkSplashScreen = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("measuring"); // measuring | loading | done | fadeout
  const [networkSpeed, setNetworkSpeed] = useState(undefined); // undefined = not yet measured
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [speedInfo, setSpeedInfo] = useState(null);
  const [statusText, setStatusText] = useState("Checking network…");
  const [logoAnim, setLogoAnim] = useState(false);
  const progressRef = useRef(0);
  const rafRef = useRef(null);
  const doneRef = useRef(false);

  // Listen to online/offline events
  useEffect(() => {
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Animate progress bar smoothly toward a target value
  const animateTowards = useCallback((target, speedMultiplier = 1) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const step = () => {
      if (progressRef.current >= target) return;
      const diff = target - progressRef.current;
      // Smooth easing: faster when far, slower when near
      const increment = Math.max(0.15, diff * 0.035) * speedMultiplier;
      progressRef.current = Math.min(target, progressRef.current + increment);
      setProgress(Math.round(progressRef.current));
      if (progressRef.current < target) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const finishSplash = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase("fadeout");
    setTimeout(() => {
      onDone?.();
    }, 600);
  }, [onDone]);

  // Main initialization flow
  useEffect(() => {
    setLogoAnim(true);

    // Phase 0 – not online at all
    if (!navigator.onLine) {
      setIsOnline(false);
      setSpeedInfo(getSpeedLabel(null));
      setStatusText("No network connection detected.");
      setProgress(0);
      setPhase("offline");
      return;
    }

    // Phase 1 – animate to 20% quickly while measuring speed
    setStatusText("Connecting to servers…");
    animateTowards(20, 2);

    // Use Network Information API if available (Chrome/Android)
    const nav = navigator;
    let estimatedMbps = null;

    if (nav.connection) {
      const conn = nav.connection;
      const downlink = conn.downlink; // Mbps
      const effectiveType = conn.effectiveType; // '2g','3g','4g','slow-2g'
      if (downlink) {
        estimatedMbps = downlink;
      } else {
        const typeMap = { "slow-2g": 0.1, "2g": 0.25, "3g": 1.5, "4g": 20 };
        estimatedMbps = typeMap[effectiveType] ?? 5;
      }
    }

    let measurePromise;
    if (estimatedMbps !== null) {
      // Already have a good estimate, skip fetch measurement
      measurePromise = Promise.resolve(estimatedMbps);
    } else {
      // Fallback: fetch a small file to measure
      measurePromise = measureNetworkSpeed();
    }

    measurePromise.then((mbps) => {
      setNetworkSpeed(mbps);
      const info = getSpeedLabel(mbps);
      setSpeedInfo(info);

      if (mbps === null) {
        // Fetch failed – treat as offline
        setStatusText("No network connection detected.");
        setPhase("offline");
        setProgress(0);
        return;
      }

      // Phase 2 – adjust loading speed based on network quality
      let loadSpeed = 1;
      let totalTime = 2800; // ms to finish loading
      if (mbps < 0.5) {
        loadSpeed = 0.4;
        totalTime = 6000;
        setStatusText("Slow network detected. Loading…");
      } else if (mbps < 2) {
        loadSpeed = 0.7;
        totalTime = 4000;
        setStatusText("Loading with moderate speed…");
      } else if (mbps < 10) {
        loadSpeed = 1.2;
        totalTime = 2500;
        setStatusText("Good connection. Loading…");
      } else {
        loadSpeed = 2.0;
        totalTime = 1800;
        setStatusText("Fast connection! Loading…");
      }

      setPhase("loading");

      // Animate progress in stages
      setTimeout(() => animateTowards(50, loadSpeed), 200);
      setTimeout(() => {
        setStatusText("Syncing device data…");
        animateTowards(80, loadSpeed);
      }, totalTime * 0.4);
      setTimeout(() => {
        setStatusText("Almost ready…");
        animateTowards(99, loadSpeed * 0.6);
      }, totalTime * 0.75);

      // Complete
      setTimeout(() => {
        progressRef.current = 100;
        setProgress(100);
        setStatusText("Ready!");
        setPhase("done");
        setTimeout(finishSplash, 450);
      }, totalTime);
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If came back online while on offline screen
  useEffect(() => {
    if (isOnline && phase === "offline") {
      setPhase("measuring");
      setTimeout(() => window.location.reload(), 800);
    }
  }, [isOnline, phase]);

  const isOfflinePhase = phase === "offline" || (!isOnline && phase !== "done");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        @keyframes kmSplashFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes kmSplashFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; pointer-events: none; }
        }
        @keyframes kmLogoEntrance {
          0%   { opacity: 0; transform: scale(0.82) translateY(8px); filter: blur(8px); }
          60%  { opacity: 1; filter: blur(0); }
          80%  { transform: scale(1.04) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes kmPulseRing {
          0%   { transform: scale(1);    opacity: 0.6; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes kmBarShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes kmDotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @keyframes kmOfflineShake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-6px); }
          40%     { transform: translateX(6px); }
          60%     { transform: translateX(-4px); }
          80%     { transform: translateX(4px); }
        }
        @keyframes kmSpinRing {
          to { transform: rotate(360deg); }
        }
        @keyframes kmParticleFloat {
          0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.15; }
          50%     { transform: translateY(-20px) rotate(180deg); opacity: 0.3; }
        }

        .km-splash-root {
          font-family: 'Inter', sans-serif;
          animation: ${phase === "fadeout" ? "kmSplashFadeOut 0.6s ease forwards" : "none"};
        }
        .km-logo-anim {
          animation: kmLogoEntrance 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
        }
        .km-bar-fill {
          background: linear-gradient(
            90deg,
            #15803d 0%,
            #22c55e 40%,
            #4ade80 60%,
            #22c55e 80%,
            #15803d 100%
          );
          background-size: 200% auto;
          animation: kmBarShimmer 1.8s linear infinite;
          transition: width 0.25s ease;
        }
        .km-dot { animation: kmDotBounce 1.2s ease-in-out infinite; }
        .km-dot:nth-child(2) { animation-delay: 0.2s; }
        .km-dot:nth-child(3) { animation-delay: 0.4s; }
        .km-offline-icon { animation: kmOfflineShake 0.5s ease 0.3s; }
        .km-spin { animation: kmSpinRing 1.6s linear infinite; }
      `}</style>

      {/* ── Full-screen overlay ── */}
      <div
        className="km-splash-root"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0f0a 0%, #0d1f0d 40%, #091409 100%)",
          overflow: "hidden",
        }}
      >
        {/* Background particles */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)",
              width: 80 + (i * 30) % 200,
              height: 80 + (i * 30) % 200,
              top: `${(i * 17 + 5) % 90}%`,
              left: `${(i * 23 + 3) % 90}%`,
              animation: `kmParticleFloat ${5 + (i % 4)}s ease-in-out ${i * 0.4}s infinite`,
              filter: "blur(24px)",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* ── Card ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            animation: "kmSplashFadeIn 0.55s ease both",
            zIndex: 1,
            width: "min(90vw, 380px)",
          }}
        >
          {/* Logo with pulse rings */}
          <div style={{ position: "relative", marginBottom: 28 }}>
            {/* Pulse rings (only during loading) */}
            {phase === "loading" && (
              <>
                <div style={{
                  position: "absolute", inset: -20, borderRadius: "50%",
                  border: "2px solid rgba(34,197,94,0.4)",
                  animation: "kmPulseRing 2s ease-out infinite",
                }} />
                <div style={{
                  position: "absolute", inset: -20, borderRadius: "50%",
                  border: "2px solid rgba(34,197,94,0.25)",
                  animation: "kmPulseRing 2s ease-out 0.7s infinite",
                }} />
              </>
            )}

            {/* Spinning ring (measuring) */}
            {phase === "measuring" && (
              <div
                className="km-spin"
                style={{
                  position: "absolute", inset: -8, borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: "#22c55e",
                  borderRightColor: "rgba(34,197,94,0.3)",
                }}
              />
            )}

            <div className={logoAnim ? "km-logo-anim" : ""} style={{ borderRadius: "50%" }}>
              <img
                src={logoImg}
                alt="Kisan Mithr"
                style={{
                  width: 96, height: 96,
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                  border: "3px solid rgba(34,197,94,0.35)",
                  boxShadow: "0 0 40px rgba(34,197,94,0.2), 0 0 80px rgba(34,197,94,0.08)",
                }}
              />
            </div>
          </div>

          {/* Brand name */}
          <h1 style={{
            fontSize: 26, fontWeight: 700, letterSpacing: "0.18em",
            background: "linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #16a34a 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0, marginBottom: 4,
          }}>
            KISAN MITHR
          </h1>
          <p style={{
            fontSize: 11, letterSpacing: "0.25em", color: "rgba(134,239,172,0.5)",
            textTransform: "uppercase", margin: 0, marginBottom: 36,
          }}>
            Smart Farming Platform
          </p>

          {/* ── OFFLINE STATE ── */}
          {isOfflinePhase ? (
            <div style={{
              width: "100%",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 14,
              padding: "20px 24px",
              textAlign: "center",
              animation: "kmSplashFadeIn 0.4s ease both",
            }}>
              <div className="km-offline-icon" style={{ fontSize: 40, marginBottom: 10 }}>📵</div>
              <p style={{ color: "#f87171", fontWeight: 600, fontSize: 16, margin: 0, marginBottom: 6 }}>
                No Network Connection
              </p>
              <p style={{ color: "rgba(248,113,113,0.7)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                Please connect to the internet and we'll automatically reload the page.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                <div className="km-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#f87171" }} />
                <div className="km-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#f87171" }} />
                <div className="km-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#f87171" }} />
              </div>
            </div>
          ) : (
            <>
              {/* ── PROGRESS BAR SECTION ── */}
              <div style={{ width: "100%" }}>
                {/* Speed indicator badge */}
                {speedInfo && phase !== "measuring" && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    marginBottom: 10, justifyContent: "center",
                    animation: "kmSplashFadeIn 0.4s ease both",
                  }}>
                    <span style={{ fontSize: 14 }}>{speedInfo.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: speedInfo.color, letterSpacing: "0.05em" }}>
                      {speedInfo.label}
                    </span>
                    {networkSpeed !== null && networkSpeed !== undefined && (
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 2 }}>
                        ({networkSpeed.toFixed(1)} Mbps)
                      </span>
                    )}
                  </div>
                )}

                {/* Track */}
                <div style={{
                  width: "100%", height: 6, borderRadius: 99,
                  background: "rgba(255,255,255,0.07)",
                  overflow: "hidden",
                  border: "1px solid rgba(34,197,94,0.1)",
                }}>
                  <div
                    className="km-bar-fill"
                    style={{
                      height: "100%",
                      width: `${progress}%`,
                      borderRadius: 99,
                    }}
                  />
                </div>

                {/* Progress % and status */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  marginTop: 8, alignItems: "center",
                }}>
                  <span style={{ fontSize: 12, color: "rgba(134,239,172,0.6)", letterSpacing: "0.05em" }}>
                    {statusText}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#4ade80", minWidth: 36, textAlign: "right" }}>
                    {progress}%
                  </span>
                </div>
              </div>

              {/* Slow network warning */}
              {speedInfo && networkSpeed !== null && networkSpeed < 2 && phase === "loading" && (
                <div style={{
                  marginTop: 20, width: "100%",
                  background: "rgba(234,179,8,0.08)",
                  border: "1px solid rgba(234,179,8,0.2)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 9,
                  animation: "kmSplashFadeIn 0.5s ease both",
                }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(253,224,71,0.8)", lineHeight: 1.4 }}>
                    {networkSpeed < 0.5
                      ? "Very slow connection — this may take longer than usual."
                      : "Slow network detected — loading may be slower than usual."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default NetworkSplashScreen;
