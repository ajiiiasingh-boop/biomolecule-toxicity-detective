/**
 * CellDiagram.jsx — the interactive simplified cell.
 *
 * Drawn to scale-free proportions in a 0–100 coordinate space so it stays
 * legible from a phone to a projector. It is a schematic and says so: a real
 * cell is crowded, irregular and has far more of everything.
 *
 * Two selection modes drive it. Picking a biomolecule lights the compartments
 * where that class lives and does its work. Picking a mechanism traces the
 * route that mechanism takes through the cell, as an animated dashed path.
 *
 * Geometry note: the cell body is a circle of radius 32 at (50, 50), leaving a
 * clear margin all round for the labels — the outermost label baseline sits at
 * y = 98, well outside the membrane, so no leader line ever crosses text.
 */

import { useMemo } from 'react';

const CX = 50;
const CY = 50;
const R_OUT = 32;

/* Label anchors, kept here rather than in the data file because they are a
   property of this drawing, not of the biology. */
const LABEL = {
  membrane: { x: 50, y: 5, anchor: 'middle', leader: [[50, 6.4], [50, 17]] },
  nucleus: {
    x: 98,
    y: 19,
    anchor: 'end',
    text: 'Nucleus / DNA',
    leader: [[86, 20.4], [68, 36]]
  },
  mitochondria: { x: 2, y: 19, anchor: 'start', leader: [[16, 20.4], [31, 33]] },
  cytoplasm: { x: 2, y: 90, anchor: 'start', leader: [[14, 87.4], [26, 70]] },
  er: { x: 98, y: 90, anchor: 'end', leader: [[86, 87.4], [74, 70]] },
  enzymes: { x: 50, y: 98, anchor: 'middle', leader: [[50, 95.4], [46, 82]] }
};

/** Waypoints for the animated mechanism routes. */
const NODE = {
  membrane: [50, 18],
  cytoplasm: [28, 66],
  nucleus: [59, 44],
  dna: [59, 44],
  mitochondria: [35, 37],
  er: [68, 63],
  enzymes: [45, 74]
};

const MITOCHONDRIA = [
  { x: 35, y: 37, rot: -26 },
  { x: 33, y: 60, rot: 32 }
];

const ENZYMES = [
  [40, 74],
  [45, 78],
  [50, 74],
  [43, 70],
  [52, 77]
];

export default function CellDiagram({ parts, activePartId, activeBiomolecule, route, onSelect }) {
  const lit = useMemo(() => {
    const set = new Set();
    if (activePartId) set.add(activePartId);
    if (activeBiomolecule) {
      parts.filter((p) => p.biomolecule === activeBiomolecule).forEach((p) => set.add(p.id));
    }
    if (route) route.path.forEach((id) => set.add(id));
    return set;
  }, [parts, activePartId, activeBiomolecule, route]);

  const on = (id) => lit.has(id);
  const dim = lit.size > 0;
  const alpha = (id, base = 1) => (dim ? (on(id) ? base : base * 0.3) : base);

  const routePoints = route ? route.path.map((id) => NODE[id] || [CX, CY]) : null;

  const hotspot = (id, label) => ({
    className: 'cell-hot',
    onClick: () => onSelect?.(id),
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect?.(id);
      }
    },
    tabIndex: 0,
    role: 'button',
    'aria-pressed': activePartId === id,
    'aria-label': label
  });

  return (
    <svg viewBox="0 0 100 100" role="img" aria-label="Simplified cell diagram with selectable compartments">
      <defs>
        <radialGradient id="cytosolFill" cx="50%" cy="46%" r="60%">
          <stop offset="0%" stopColor="#16203a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0a1020" stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id="nucleusFill" cx="44%" cy="36%" r="72%">
          <stop offset="0%" stopColor="#1c3763" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#101f3c" stopOpacity="0.96" />
        </radialGradient>
      </defs>

      {/* ---------------------------------------------------- cytoplasm */}
      <g {...hotspot('cytoplasm', 'Cytoplasm')}>
        <circle cx={CX} cy={CY} r={R_OUT - 2.2} fill="url(#cytosolFill)" opacity={alpha('cytoplasm', 1)} />
        {on('cytoplasm') && (
          <circle
            cx={CX}
            cy={CY}
            r={R_OUT - 4.5}
            fill="none"
            stroke="var(--ch-carb)"
            strokeWidth="0.7"
            strokeDasharray="2 2.4"
            opacity="0.8"
          />
        )}
      </g>

      {/* ----------------------------------------------- plasma membrane */}
      <g {...hotspot('membrane', 'Plasma membrane')}>
        {on('membrane') && (
          <circle cx={CX} cy={CY} r={R_OUT - 1} fill="none" stroke="var(--ch-lipid)" strokeWidth="4" opacity="0.15" />
        )}
        <circle
          cx={CX}
          cy={CY}
          r={R_OUT}
          fill="none"
          stroke="var(--ch-lipid)"
          strokeWidth="1.3"
          opacity={alpha('membrane', 0.92)}
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_OUT - 2}
          fill="none"
          stroke="var(--ch-lipid)"
          strokeWidth="1.3"
          opacity={alpha('membrane', 0.92)}
        />
        {[18, 62, 128, 205, 250, 312].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const px = CX + Math.cos(rad) * (R_OUT - 1);
          const py = CY + Math.sin(rad) * (R_OUT - 1);
          return (
            <rect
              key={deg}
              x={px - 1.4}
              y={py - 1.4}
              width="2.8"
              height="2.8"
              rx="0.7"
              fill="var(--ch-protein)"
              opacity={alpha('membrane', 0.9)}
              transform={`rotate(${deg + 90} ${px} ${py})`}
            />
          );
        })}
      </g>

      {/* ------------------------------------------------------- nucleus */}
      <g {...hotspot('nucleus', 'Nucleus and DNA')}>
        <circle
          cx="59"
          cy="44"
          r="11.5"
          fill="url(#nucleusFill)"
          stroke="var(--ch-dna)"
          strokeWidth={on('nucleus') || on('dna') ? 1 : 0.6}
          opacity={alpha('nucleus', 1)}
        />
        <g opacity={alpha('dna', 0.95)} stroke="var(--ch-dna)" fill="none" strokeLinecap="round">
          <path d="M52 41.5c2-2 3.9-0.3 5.8-2s4.2-0.7 6-2" strokeWidth="0.72" />
          <path d="M51.5 46.2c2.3-1.1 3.4 1.3 5.9 0.3s4.4 1.4 6.7 0.2" strokeWidth="0.72" />
          <path d="M53 50.6c2.2-1.6 3.9 0.7 6.1-0.6s3.7 0.8 5.4-0.3" strokeWidth="0.72" />
        </g>
        <circle cx="62.5" cy="47.5" r="2.6" fill="var(--ch-dna)" opacity={alpha('nucleus', 0.3)} />
      </g>

      {/* -------------------------------------------------- mitochondria */}
      <g {...hotspot('mitochondria', 'Mitochondria')} opacity={alpha('mitochondria', 1)}>
        {MITOCHONDRIA.map((m) => (
          <g key={`${m.x}-${m.y}`} transform={`rotate(${m.rot} ${m.x} ${m.y})`}>
            <rect
              x={m.x - 8.5}
              y={m.y - 4}
              width="17"
              height="8"
              rx="4"
              fill="rgba(184,134,11,0.18)"
              stroke="var(--ch-carb)"
              strokeWidth={on('mitochondria') ? 0.95 : 0.65}
            />
            {[-5, -1.8, 1.4, 4.6].map((dx) => (
              <path
                key={dx}
                d={`M${m.x + dx} ${m.y - 3.2} q2 1.8 0 3.2 q-2 1.4 0 3.2`}
                fill="none"
                stroke="var(--ch-carb)"
                strokeWidth="0.6"
                opacity="0.9"
              />
            ))}
          </g>
        ))}
      </g>

      {/* ------------------------------------------------------------ ER */}
      <g {...hotspot('er', 'Endoplasmic reticulum')} opacity={alpha('er', 1)}>
        {[0, 3, 6].map((dy) => (
          <path
            key={dy}
            d={`M58 ${60 + dy} q4 -2.8 8 0 t8 0`}
            fill="none"
            stroke="var(--ch-protein)"
            strokeWidth={on('er') ? 1 : 0.75}
            strokeLinecap="round"
          />
        ))}
        {[59, 63.5, 68, 72.5].map((x) => (
          <circle key={x} cx={x} cy="58.4" r="0.75" fill="var(--ch-protein)" opacity="0.9" />
        ))}
      </g>

      {/* --------------------------------------------- cytosolic enzymes */}
      <g {...hotspot('enzymes', 'Cytosolic enzymes')} opacity={alpha('enzymes', 1)}>
        {ENZYMES.map(([x, y], i) => (
          <g key={`${x}-${y}`}>
            <path
              d={`M${x - 2.4} ${y} q1.2 -2.2 2.4 0 q1.2 2.2 2.4 0`}
              fill="none"
              stroke="var(--ch-protein)"
              strokeWidth={on('enzymes') ? 1 : 0.75}
              strokeLinecap="round"
            />
            {i % 2 === 0 && <circle cx={x} cy={y - 1.5} r="0.65" fill="var(--ch-protein)" opacity="0.85" />}
          </g>
        ))}
      </g>

      {/* ----------------------------------------------- mechanism route */}
      {routePoints && routePoints.length > 1 && (
        <g>
          <polyline
            points={routePoints.map((p) => p.join(',')).join(' ')}
            fill="none"
            stroke="var(--key)"
            strokeWidth="0.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2.4 2.2"
            opacity="0.92"
          >
            <animate attributeName="stroke-dashoffset" from="9.2" to="0" dur="1.1s" repeatCount="indefinite" />
          </polyline>
          {routePoints.map((p, i) => (
            <circle key={`${p[0]}-${p[1]}-${i}`} cx={p[0]} cy={p[1]} r="1.4" fill="var(--key)" opacity="0.95" />
          ))}
        </g>
      )}

      {/* ------------------------------------------------------- labels */}
      {parts
        .filter((p) => !p.nested)
        .map((p) => {
          const l = LABEL[p.id];
          if (!l) return null;
          return (
            <g key={`label-${p.id}`}>
              {l.leader && (
                <polyline
                  points={l.leader.map((pt) => pt.join(',')).join(' ')}
                  fill="none"
                  stroke="var(--edge-strong)"
                  strokeWidth="0.35"
                />
              )}
              <text
                x={l.x}
                y={l.y}
                textAnchor={l.anchor}
                className={on(p.id) ? 'cell-label cell-label--on' : 'cell-label'}
              >
                {l.text || p.name}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
