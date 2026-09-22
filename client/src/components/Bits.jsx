/**
 * Bits.jsx — the small repeated pieces, defined once so every page composes
 * the same object rather than a near-copy of it.
 */

import { biomoleculeById, mechanismById } from '@shared/index.js';
import { Glyph } from './Glyphs.jsx';

/** A biomolecule identity chip: colour + icon + name, never colour alone. */
export function ChannelChip({ id, showIcon = true }) {
  const bm = biomoleculeById(id);
  if (!bm) return null;
  return (
    <span className="chip chip--channel" data-channel={id}>
      {showIcon ? <Glyph name={bm.glyph} size={13} /> : <i className="chip__dot" />}
      {bm.label}
    </span>
  );
}

export function MechanismChip({ id }) {
  const m = mechanismById(id);
  if (!m) return null;
  return (
    <span className="chip" data-channel={m.biomolecule}>
      <i className="chip__dot" />
      {m.label}
    </span>
  );
}

export function SectionHead({ eyebrow, title, children }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="display" style={{ fontSize: 'var(--t-h2)', marginTop: 4 }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export function PageHead({ eyebrow, title, lede, children }) {
  return (
    <header className="stack stack-4" style={{ marginBottom: 'var(--s-6)' }}>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display" style={{ fontSize: 'var(--t-h1)' }}>
        {title}
      </h1>
      {lede && <p className="lede">{lede}</p>}
      {children}
    </header>
  );
}

export function Readouts({ items }) {
  return (
    <div>
      {items.map((r) => (
        <div className="readout" key={r.label} data-state={r.state || 'info'}>
          <span className="readout__label">{r.label}</span>
          <span className="readout__value">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Disclaimer({ compact = false }) {
  return (
    <p className="disclaimer">
      <b>Educational simulation.</b>{' '}
      {compact
        ? 'All cases and numerical values on this site are invented for teaching and are not real measurements.'
        : 'This website is an educational simulation created to demonstrate how toxic stress can affect biomolecules and cellular processes. The cases, numerical values and investigation outcomes are simplified models intended for learning and should not be interpreted as clinical, diagnostic or real-world toxicology assessments.'}
    </p>
  );
}
