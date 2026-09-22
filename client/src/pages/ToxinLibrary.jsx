import { useEffect, useState } from 'react';
import { fetchToxins } from '../lib/api.js';
import { biomoleculeById } from '@shared/index.js';
import { Arrow, Glyph } from '../components/Glyphs.jsx';
import { Disclaimer, PageHead } from '../components/Bits.jsx';

export default function ToxinLibrary() {
  const [categories, setCategories] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    fetchToxins().then((d) => {
      setCategories(d.categories);
      setActiveId(d.categories[0].id);
    });
  }, []);

  const active = categories.find((c) => c.id === activeId);

  return (
    <div className="wrap stack stack-6">
      <PageHead
        eyebrow="Toxin library"
        title="Classes of stressor, and what they do to a molecule"
        lede="A mechanism reference, organised by class of stressor. Each entry follows the same chain: what it targets, how it acts on that target, what the cell loses as a result, and which markers report it."
      >
        <p className="note" style={{ maxWidth: '68ch' }}>
          Scope: these entries describe only what happens inside a cell once a substance is already
          there. Nothing here covers obtaining, preparing, concentrating or handling any substance,
          and nothing here is exposure guidance.
        </p>
      </PageHead>

      <div className="db-layout">
        <nav className="db-nav" aria-label="Toxin categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              aria-pressed={cat.id === activeId}
              onClick={() => setActiveId(cat.id)}
              data-channel={cat.entries[0]?.target}
            >
              <span>
                <b style={{ display: 'block', fontWeight: 600 }}>{cat.name}</b>
                <span className="note" style={{ textTransform: 'none', letterSpacing: 0 }}>
                  {cat.entries.length} entries
                </span>
              </span>
            </button>
          ))}
        </nav>

        {active && (
          <article className="tox-cat">
            <header className="panel panel--pad stack stack-3">
              <h2 className="display" style={{ fontSize: 'var(--t-h2)' }}>
                {active.name}
              </h2>
              <p style={{ color: 'var(--ink-3)', fontSize: 'var(--t-small)' }}>{active.tagline}</p>
              <p className="prose">{active.overview}</p>
            </header>

            {active.entries.map((entry) => {
              const bm = biomoleculeById(entry.target);
              return (
                <section className="tox-entry" key={entry.name} data-channel={entry.target}>
                  <div>
                    <h4>{entry.name}</h4>
                    <span className="chip chip--channel" data-channel={entry.target}>
                      <Glyph name={bm.glyph} size={13} />
                      {bm.label}
                    </span>
                    <p className="note" style={{ marginTop: 10, textTransform: 'none', letterSpacing: 0 }}>
                      {entry.targetNote}
                    </p>
                  </div>

                  <div className="stack stack-3">
                    <p className="tox-field">
                      <b>Mechanism</b>
                      {entry.mechanism}
                    </p>
                  </div>

                  <div className="stack stack-3">
                    <p className="tox-field">
                      <b>Cellular consequence</b>
                      {entry.consequence}
                    </p>
                    <div className="marker-row">
                      {entry.markers.map((m) => (
                        <span className="chip" key={m}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="tox-chain" style={{ gridColumn: '1 / -1' }}>
                    <span>{entry.name}</span>
                    <Arrow size={12} />
                    <span>{bm.short}</span>
                    <Arrow size={12} />
                    <span>{entry.mechanism.split('.')[0].slice(0, 54)}…</span>
                    <Arrow size={12} />
                    <span>{entry.consequence.split('.')[0].slice(0, 54)}…</span>
                  </div>
                </section>
              );
            })}
          </article>
        )}
      </div>

      <Disclaimer />
    </div>
  );
}
