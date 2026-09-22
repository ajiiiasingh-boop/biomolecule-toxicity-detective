import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCellMap } from '../lib/api.js';
import { BIOMOLECULES, biomoleculeById, mechanismById, CASES } from '@shared/index.js';
import CellDiagram from '../components/CellDiagram.jsx';
import { Glyph, Arrow } from '../components/Glyphs.jsx';
import { Disclaimer, PageHead } from '../components/Bits.jsx';

export default function CellLab() {
  const [cellMap, setCellMap] = useState(null);
  const [partId, setPartId] = useState(null);
  const [biomolecule, setBiomolecule] = useState(null);
  const [mechanism, setMechanism] = useState(null);

  useEffect(() => {
    fetchCellMap().then((d) => setCellMap(d.cellMap));
  }, []);

  const part = useMemo(
    () => cellMap?.parts.find((p) => p.id === partId) || null,
    [cellMap, partId]
  );
  const route = mechanism && cellMap ? cellMap.routes[mechanism] : null;

  if (!cellMap) return <p className="wrap empty">Loading the cell…</p>;

  const selectPart = (id) => {
    setPartId((prev) => (prev === id ? null : id));
    setMechanism(null);
  };

  const clearAll = () => {
    setPartId(null);
    setBiomolecule(null);
    setMechanism(null);
  };

  return (
    <div className="wrap stack stack-6">
      <PageHead
        eyebrow="Cell lab"
        title="Where each molecule lives, and where it gets hit"
        lede="A simplified cell. Select a compartment to read what it does and what happens to it under toxic stress, filter by biomolecule to see where that class is at work, or pick a mechanism to trace the route it takes through the cell."
      />

      <div className="cell-layout">
        <div className="stack stack-4">
          <div className="cell-stage">
            <CellDiagram
              parts={cellMap.parts}
              activePartId={partId}
              activeBiomolecule={biomolecule}
              route={route}
              onSelect={selectPart}
            />
          </div>
          <p className="note">
            Schematic, not to scale. A real cell is far more crowded, and organelle numbers and shapes
            vary widely between cell types.
          </p>
        </div>

        <div className="stack stack-5">
          <section className="stack stack-3">
            <p className="subhead">Highlight a biomolecule class</p>
            <div className="filter-row">
              {BIOMOLECULES.map((bm) => (
                <button
                  key={bm.id}
                  type="button"
                  className="filter-btn"
                  data-channel={bm.id}
                  aria-pressed={biomolecule === bm.id}
                  onClick={() => {
                    setBiomolecule((prev) => (prev === bm.id ? null : bm.id));
                    setMechanism(null);
                  }}
                >
                  <Glyph name={bm.glyph} size={13} />
                  {bm.short}
                </button>
              ))}
            </div>
          </section>

          <section className="stack stack-3">
            <p className="subhead">Trace a toxicity route</p>
            <div className="filter-row">
              {Object.entries(cellMap.routes).map(([id, r]) => {
                const m = mechanismById(id);
                return (
                  <button
                    key={id}
                    type="button"
                    className="filter-btn"
                    data-channel={m?.biomolecule}
                    aria-pressed={mechanism === id}
                    onClick={() => {
                      setMechanism((prev) => (prev === id ? null : id));
                      setPartId(null);
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
            {(partId || biomolecule || mechanism) && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={clearAll} style={{ alignSelf: 'flex-start' }}>
                Clear selection
              </button>
            )}
          </section>

          {route && (
            <section className="panel panel--pad stack stack-3" data-channel={mechanismById(mechanism)?.biomolecule}>
              <p className="eyebrow">Route · {route.label}</p>
              <p style={{ fontSize: 'var(--t-small)', color: 'var(--ink-2)' }}>{route.note}</p>
              <div className="tox-chain">
                {route.path.map((id, i) => (
                  <span key={id} className="row" style={{ gap: 'var(--s-2)' }}>
                    {i > 0 && <Arrow size={12} />}
                    {cellMap.parts.find((p) => p.id === id)?.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {part ? (
            <section className="panel panel--pad stack stack-4" data-channel={part.biomolecule}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3 className="display" style={{ fontSize: '1.45rem' }}>
                  {part.name}
                </h3>
                <span className="chip chip--channel" data-channel={part.biomolecule}>
                  <Glyph name={biomoleculeById(part.biomolecule).glyph} size={13} />
                  {biomoleculeById(part.biomolecule).label}
                </span>
              </div>
              <div className="stack stack-3">
                <div>
                  <p className="eyebrow">Normal function</p>
                  <p style={{ fontSize: 'var(--t-small)', color: 'var(--ink-2)', marginTop: 4 }}>
                    {part.function}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Under toxic stress</p>
                  <p style={{ fontSize: 'var(--t-small)', color: 'var(--ink-2)', marginTop: 4 }}>
                    {part.underToxicity}
                  </p>
                </div>
              </div>
              {part.caseIds?.length > 0 && (
                <div className="row">
                  {part.caseIds.map((cid) => {
                    const c = CASES.find((x) => x.id === cid);
                    if (!c) return null;
                    return (
                      <Link key={cid} to={`/cases/${cid}`} className="btn btn--ghost btn--sm">
                        Case {c.number} · {c.title}
                        <Arrow size={12} className="btn__arrow" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            <section className="locked">
              <p className="eyebrow">Compartment detail</p>
              <p className="note">
                Select any labelled part of the cell to read what it does and how toxic stress reaches
                it.
              </p>
            </section>
          )}

          <Disclaimer compact />
        </div>
      </div>
    </div>
  );
}
