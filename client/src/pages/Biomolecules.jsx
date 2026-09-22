import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchBiomolecules } from '../lib/api.js';
import { CASES } from '@shared/index.js';
import { Glyph, Arrow } from '../components/Glyphs.jsx';
import { Disclaimer, PageHead } from '../components/Bits.jsx';

export default function Biomolecules() {
  const [list, setList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchBiomolecules().then((d) => {
      setList(d.biomolecules);
      const fromHash = location.hash.replace('#', '');
      setActiveId(d.biomolecules.some((b) => b.id === fromHash) ? fromHash : d.biomolecules[0].id);
    });
    // location.hash is read once on mount and again when it changes below
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fromHash = location.hash.replace('#', '');
    if (fromHash && list.some((b) => b.id === fromHash)) setActiveId(fromHash);
  }, [location.hash, list]);

  const active = list.find((b) => b.id === activeId);

  return (
    <div className="wrap stack stack-6">
      <PageHead
        eyebrow="Biomolecule database"
        title="The four classes, and how they break"
        lede="Reference entries for the molecules the cases are built around. Each one covers what the molecule is, what holds it together, the specific ways toxic stress damages it, what the cell does about it, and the laboratory markers that report the damage."
      />

      <div className="db-layout">
        <nav className="db-nav" aria-label="Biomolecule classes">
          {list.map((bm) => (
            <button
              key={bm.id}
              type="button"
              data-channel={bm.id}
              aria-pressed={bm.id === activeId}
              onClick={() => setActiveId(bm.id)}
            >
              <span style={{ color: 'var(--channel)', display: 'flex' }}>
                <Glyph name={bm.glyph} size={20} />
              </span>
              <span>
                <b style={{ display: 'block', fontWeight: 600 }}>{bm.label}</b>
                <span className="note" style={{ textTransform: 'none', letterSpacing: 0 }}>
                  {bm.short}
                </span>
              </span>
            </button>
          ))}
        </nav>

        {active && (
          <article className="stack stack-6" data-channel={active.id} id={active.id}>
            <header className="panel panel--pad stack stack-4">
              <div className="row" style={{ gap: 'var(--s-4)' }}>
                <span style={{ color: 'var(--channel)', display: 'flex' }}>
                  <Glyph name={active.glyph} size={40} />
                </span>
                <div>
                  <h2 className="display" style={{ fontSize: 'var(--t-h2)' }}>
                    {active.label}
                  </h2>
                  <p className="note" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 'var(--t-small)' }}>
                    {active.tagline}
                  </p>
                </div>
              </div>
              <p className="prose">{active.summary}</p>
              <dl className="case-header__meta" style={{ borderTop: '1px solid var(--edge)', paddingTop: 'var(--s-4)' }}>
                <div>
                  <dt>Built from</dt>
                  <dd>{active.builtFrom}</dd>
                </div>
                <div>
                  <dt>Key job</dt>
                  <dd>{active.keyJob}</dd>
                </div>
              </dl>
            </header>

            <section className="stack stack-4">
              <p className="subhead">Structure</p>
              <ul className="bullets">
                {active.structure.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>

            <section className="stack stack-4">
              <p className="subhead">How toxicity affects it</p>
              <div className="mech-list">
                {active.howToxicityHits.map((h) => (
                  <div className="mech-item" key={h.title} data-channel={active.id}>
                    <h4>{h.title}</h4>
                    <p>{h.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="stack stack-4">
              <p className="subhead">What the cell does about it</p>
              <ul className="bullets">
                {active.repair.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>

            <section className="stack stack-4">
              <p className="subhead">Laboratory markers</p>
              <div className="marker-row">
                {active.markers.map((m) => (
                  <span className="chip" key={m}>
                    {m}
                  </span>
                ))}
              </div>
              <p className="note">
                These are the readouts the case files use. When a marker moves in an evidence card, it
                is pointing at this class.
              </p>
            </section>

            <section className="stack stack-4">
              <p className="subhead">Cases involving this class</p>
              <div className="row">
                {CASES.filter((c) => c.channel === active.id).map((c) => (
                  <Link key={c.id} to={`/cases/${c.id}`} className="btn btn--ghost btn--sm">
                    Case {c.number} · {c.title}
                    <Arrow size={12} className="btn__arrow" />
                  </Link>
                ))}
              </div>
            </section>
          </article>
        )}
      </div>

      <Disclaimer compact />
    </div>
  );
}
