/**
 * Glyphs.jsx — the icon set, drawn inline as SVG.
 *
 * Drawn rather than pulled from an icon font because four of them are
 * structural pictures of the biomolecules themselves — a double helix, a
 * folded chain, a bilayer, a pyranose ring — and a generic icon library has
 * nothing that means those things. Everything uses currentColor so an icon
 * inherits whichever channel colour its container sets.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

export function Helix({ size = 24, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M6.5 2.5c0 4.5 11 6.5 11 9.5s-11 5-11 9.5" />
      <path d="M17.5 2.5c0 4.5-11 6.5-11 9.5s11 5 11 9.5" />
      <path d="M8.2 6.4h7.6M6.8 9.8h10.4M6.8 14.2h10.4M8.2 17.6h7.6" strokeWidth="1.1" />
    </svg>
  );
}

export function Fold({ size = 24, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M3 17c2.6 0 2.6-5 5.2-5S10.8 19 13.4 19 16 8 18.6 8 21 11 21 11" />
      <path d="M3 8.5c2 0 2.4-3.5 4.6-3.5" strokeWidth="1.2" opacity="0.65" />
      <circle cx="18.6" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Bilayer({ size = 24, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      {[5, 12, 19].map((x) => (
        <g key={x}>
          <circle cx={x} cy="6.2" r="2.4" />
          <line x1={x} y1="8.8" x2={x} y2="11.3" strokeWidth="1.3" />
          <circle cx={x} cy="17.8" r="2.4" />
          <line x1={x} y1="15.2" x2={x} y2="12.7" strokeWidth="1.3" />
        </g>
      ))}
    </svg>
  );
}

export function Ring({ size = 24, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M12 3.5 19 7.6v8.3L12 20l-7-4.1V7.6z" />
      <path d="M12 3.5V7M19 7.6l-3.1 1.8M5 15.9l3.1-1.8" strokeWidth="1.1" opacity="0.7" />
      <circle cx="12" cy="11.8" r="1.4" fill="currentColor" stroke="none" opacity="0.8" />
    </svg>
  );
}

export function Microscope({ size = 24, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M6 21h13" />
      <path d="M9.5 21a5.5 5.5 0 0 0 5.5-5.5" />
      <path d="M8 15h5" />
      <path d="m12.6 4.6 2.8 2.8-4.2 4.2-2.8-2.8z" />
      <path d="m14.2 3 2.8 2.8" />
      <path d="M7 12.5 9.6 15" />
    </svg>
  );
}

export function ChartGlyph({ size = 24, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M7.5 16V11M12 16V7M16.5 16v-3" strokeWidth="2.2" />
    </svg>
  );
}

export function Warning({ size = 24, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M12 3.8 21 19.5H3z" />
      <path d="M12 9.5v4.2" />
      <circle cx="12" cy="16.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Cell({ size = 24, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="13.6" cy="10.4" r="3.4" />
      <ellipse cx="7.6" cy="15" rx="2.6" ry="1.5" transform="rotate(-28 7.6 15)" />
      <circle cx="13.6" cy="10.4" r="1" fill="currentColor" stroke="none" opacity="0.7" />
    </svg>
  );
}

export function Flask({ size = 24, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M9.5 3v6.2L4.4 18a2 2 0 0 0 1.7 3h11.8a2 2 0 0 0 1.7-3l-5.1-8.8V3" />
      <path d="M8.2 3h7.6" />
      <path d="M7 15.2h10" strokeWidth="1.2" opacity="0.7" />
    </svg>
  );
}

export function Search({ size = 24, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.4 15.4 4.6 4.6" />
    </svg>
  );
}

export function Arrow({ size = 16, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M4 12h15" />
      <path d="m13.5 6.5 6 5.5-6 5.5" />
    </svg>
  );
}

export function ArrowDown({ size = 16, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M12 4v15" />
      <path d="m6.5 13.5 5.5 6 5.5-6" />
    </svg>
  );
}

export function Check({ size = 18, ...rest }) {
  return (
    <svg {...base} strokeWidth="2.4" width={size} height={size} aria-hidden="true" {...rest}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function Cross({ size = 18, ...rest }) {
  return (
    <svg {...base} strokeWidth="2.2" width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

export function Menu({ size = 20, ...rest }) {
  return (
    <svg {...base} strokeWidth="1.8" width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function Lock({ size = 14, ...rest }) {
  return (
    <svg {...base} width={size} height={size} aria-hidden="true" {...rest}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

/** The wordmark: a hexagonal specimen frame with a helix caught inside it. */
export function BrandMark({ size = 34, ...rest }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" {...rest}>
      <path
        d="M20 2.5 35.2 11v18L20 37.5 4.8 29V11z"
        fill="rgba(57,135,229,0.10)"
        stroke="rgba(137,173,232,0.45)"
        strokeWidth="1.2"
      />
      <path
        d="M14.5 10c0 6 11 8 11 14s-11 8-11 14"
        fill="none"
        stroke="#3987e5"
        strokeWidth="1.7"
        strokeLinecap="round"
        transform="translate(0 -4) scale(1 0.78) translate(0 4)"
      />
      <path
        d="M25.5 10c0 6-11 8-11 14s11 8 11 14"
        fill="none"
        stroke="#2a9d8f"
        strokeWidth="1.7"
        strokeLinecap="round"
        transform="translate(0 -4) scale(1 0.78) translate(0 4)"
      />
      <circle cx="20" cy="20" r="2.2" fill="#e9f1ff" />
    </svg>
  );
}

const MAP = {
  helix: Helix,
  fold: Fold,
  bilayer: Bilayer,
  ring: Ring,
  microscope: Microscope,
  chart: ChartGlyph,
  dna: Helix,
  warning: Warning,
  cell: Cell,
  flask: Flask,
  search: Search
};

export function Glyph({ name, ...rest }) {
  const Component = MAP[name] || Search;
  return <Component {...rest} />;
}
