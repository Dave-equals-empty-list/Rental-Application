import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { apiGet } from "../api/client";
import "./LoadingPage.css";

// Where to go once the app is ready. Change to "/welcome" when the onboarding page exists.
const NEXT_ROUTE = "/login";
// Long enough for the house to draw itself once, even when the server answers instantly.
const MIN_DISPLAY_MS = 2600;
const TIMEOUT_MS = 6000;

/** A house that draws itself line by line, then its windows light up. Loops while loading. */
function HouseBuild({ paused }) {
  return (
    <svg className={`house${paused ? " house--paused" : ""}`} viewBox="0 0 220 180" aria-hidden="true">
      <defs>
        <filter id="window-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Window light sits behind the outlines */}
      <g filter="url(#window-glow)">
        <rect className="glow" style={{ "--d": "0s" }} x="64" y="106" width="24" height="22" rx="3" />
        <rect className="glow" style={{ "--d": ".18s" }} x="132" y="106" width="24" height="22" rx="3" />
        <circle className="glow" style={{ "--d": ".36s" }} cx="110" cy="78" r="8" />
      </g>

      <g className="lines">
        <path className="draw" style={{ "--d": "0s" }} pathLength="1" d="M14 160 H206" />
        <path className="draw" style={{ "--d": ".2s" }} pathLength="1" d="M48 160 V96 M172 160 V96" />
        <path className="draw" style={{ "--d": ".45s" }} pathLength="1" d="M34 106 L110 42 L186 106" />
        <path className="draw" style={{ "--d": ".7s" }} pathLength="1" d="M144 68 V46 H158 V80" />
        <path className="draw" style={{ "--d": ".85s" }} pathLength="1" d="M98 160 V136 a12 12 0 0 1 24 0 V160" />
        <rect className="draw" style={{ "--d": "1s" }} pathLength="1" x="64" y="106" width="24" height="22" rx="3" />
        <rect className="draw" style={{ "--d": "1.1s" }} pathLength="1" x="132" y="106" width="24" height="22" rx="3" />
        <circle className="draw" style={{ "--d": "1.2s" }} pathLength="1" cx="110" cy="78" r="8" />
      </g>
    </svg>
  );
}

export default function LoadingPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("checking"); // checking | ready | offline
  const [attempt, setAttempt] = useState(0);
  const redirectTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const minDisplay = new Promise((r) => setTimeout(r, MIN_DISPLAY_MS));

    (async () => {
      try {
        // Any lightweight GET proves the backend and database are up.
        await Promise.all([apiGet("/api/properties", { signal: controller.signal }), minDisplay]);
        if (cancelled) return;
        setPhase("ready");
        redirectTimer.current = setTimeout(() => navigate(NEXT_ROUTE, { replace: true }), 500);
      } catch {
        await minDisplay;
        if (!cancelled) setPhase("offline");
      } finally {
        clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
      clearTimeout(redirectTimer.current);
    };
  }, [attempt, navigate]);

  function retry() {
    setPhase("checking");
    setAttempt((n) => n + 1);
  }

  const status = {
    checking: "Getting your workspace ready",
    ready: "Ready",
    offline: "Can't reach the server",
  }[phase];

  return (
    <main className="loading-screen" aria-busy={phase === "checking"}>
      <div className="loading-stage">
        <HouseBuild paused={phase === "offline"} />
        <Logo tone="light" size={40} />
        <p className="loading-status" role="status" aria-live="polite">{status}</p>

        {phase === "offline" && (
          <div className="loading-offline">
            <p>
              Start the backend with <code>dotnet run</code> in the Rental-Application-main folder,
              then try again. You can also continue and work on the screens without live data.
            </p>
            <div className="loading-actions">
              <button type="button" className="loading-btn loading-btn--solid" onClick={retry}>Try again</button>
              <button type="button" className="loading-btn" onClick={() => navigate(NEXT_ROUTE)}>
                Continue without data
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
