/** Investorgate logo: an arched gateway with a keyhole, plus the wordmark. */
export default function Logo({ tone = "brand", size = 28 }) {
  const onBlue = tone === "light";
  const tile = onBlue ? "#fff" : "var(--ig-blue)";
  const mark = onBlue ? "var(--ig-blue)" : "#fff";

  return (
    <span className="ig-logo" style={{ color: onBlue ? "#fff" : "var(--ig-blue)", fontSize: size * 0.68 }}>
      <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="7" fill={tile} />
        <path d="M8 21.5V13a6 6 0 0 1 12 0v8.5" fill="none" stroke={mark} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="14" cy="14.6" r="2" fill={mark} />
        <path d="M14 16v3" stroke={mark} strokeWidth="1.9" strokeLinecap="round" />
      </svg>
      <span>investorgate</span>
    </span>
  );
}
