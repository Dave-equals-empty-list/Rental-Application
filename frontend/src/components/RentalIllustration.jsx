/**
 * Showcase illustration for the login panel.
 * Property, gateway and key feed into an application list sorted by status.
 */
const ROWS = [
  { y: 148, initials: "AL", avatar: "#4F8DF5", status: "Approved", pill: "#E3F5EC", text: "#1E7A4F" },
  { y: 190, initials: "JN", avatar: "#F29F67", status: "In review", pill: "#FDF3E1", text: "#9A6416" },
  { y: 232, initials: "MK", avatar: "#7C6CF0", status: "Submitted", pill: "#E8F0FD", text: "#0B5ED7" },
];

function Node({ cx, cy, children }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="35" fill="#fff" fillOpacity="0.22" />
      <circle cx={cx} cy={cy} r="27" fill="#fff" />
      <g transform={`translate(${cx - 12} ${cy - 12})`}>{children}</g>
    </g>
  );
}

export default function RentalIllustration() {
  return (
    <svg className="rental-illustration" viewBox="0 0 460 380" role="img"
      aria-label="A property, a gateway and a key connected to a list of rental applications">
      <defs>
        <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#062F72" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Backdrop rings */}
      <circle cx="250" cy="190" r="186" fill="#fff" fillOpacity="0.07" />
      <circle cx="250" cy="190" r="132" fill="none" stroke="#fff" strokeOpacity="0.14" />

      {/* Connectors */}
      <g fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="14" strokeLinecap="round">
        <path d="M92 92 H146 Q170 92 170 116 V264 Q170 288 146 288 H92" />
        <path d="M92 190 H250" />
      </g>

      {/* Property */}
      <Node cx={80} cy={92}>
        <path d="M3.5 11 12 3.8l8.5 7.2V20a1 1 0 0 1-1 1h-4.6v-5.4H9.1V21H4.5a1 1 0 0 1-1-1z"
          fill="none" stroke="#0B5ED7" strokeWidth="2" strokeLinejoin="round" />
      </Node>

      {/* Gateway (brand mark) */}
      <circle cx="74" cy="190" r="40" fill="#fff" fillOpacity="0.22" />
      <circle cx="74" cy="190" r="31" fill="#fff" />
      <rect x="57" y="173" width="34" height="34" rx="9" fill="#0B5ED7" />
      <path d="M66.5 199.5V187.5a7.5 7.5 0 0 1 15 0v12" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="74" cy="189" r="2.4" fill="#fff" />
      <path d="M74 190.5v4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />

      {/* Key */}
      <Node cx={80} cy={288}>
        <circle cx="8" cy="16" r="4.5" fill="none" stroke="#0B5ED7" strokeWidth="2" />
        <path d="M11.2 12.8 20 4M16.5 7.5l2.5 2.5M14 10l2 2" fill="none" stroke="#0B5ED7"
          strokeWidth="2" strokeLinecap="round" />
      </Node>

      {/* Application list card */}
      <g filter="url(#card-shadow)">
        <rect x="236" y="96" width="206" height="186" rx="10" fill="#fff" />
      </g>
      <circle cx="250" cy="110" r="3" fill="#FF6159" />
      <circle cx="260" cy="110" r="3" fill="#FFBD2E" />
      <circle cx="270" cy="110" r="3" fill="#28C840" />
      <rect x="378" y="108" width="52" height="4" rx="2" fill="#E3E8F0" />
      <rect x="248" y="122" width="72" height="16" rx="5" fill="#EEF2F8" />
      <rect x="262" y="128" width="44" height="4" rx="2" fill="#A9B4C6" />
      <rect x="336" y="128" width="40" height="4" rx="2" fill="#DCE2EC" />

      {ROWS.map((r) => (
        <g key={r.initials}>
          <rect x="246" y={r.y} width="186" height="36" rx="6" fill="#fff" stroke="#E6EBF2" />
          <circle cx="263" cy={r.y + 18} r="9" fill={r.avatar} />
          <text x="263" y={r.y + 20.6} textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff"
            fontFamily="Plus Jakarta Sans, sans-serif">{r.initials}</text>
          <rect x="279" y={r.y + 11} width="62" height="5" rx="2.5" fill="#9AA6BA" />
          <rect x="279" y={r.y + 21} width="40" height="4" rx="2" fill="#D5DCE7" />
          <rect x="368" y={r.y + 11} width="56" height="14" rx="7" fill={r.pill} />
          <text x="396" y={r.y + 20.4} textAnchor="middle" fontSize="6.6" fontWeight="600" fill={r.text}
            fontFamily="Plus Jakarta Sans, sans-serif">{r.status}</text>
        </g>
      ))}
    </svg>
  );
}
