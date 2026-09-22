import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BIOMOLECULES, CASES, QUIZ, MECHANISMS, RULE_TEXT } from '@shared/index.js';
import { Glyph, Arrow, ArrowDown, Check } from '../components/Glyphs.jsx';
import { Disclaimer, SectionHead } from '../components/Bits.jsx';
import { useSession } from '../lib/session.jsx';

/** Bars in the hero readout. Fixed illustrative values, labelled as such. */
const READOUT = {
  'dna-rna': { integrity: 34, marker: '8-oxo-dG ↑' },
  protein: { integrity: 28, marker: 'Activity ↓' },
  lipid: { integrity: 41, marker: 'MDA ↑' },
  carbohydrate: { integrity: 52, marker: 'ATP ↓' }
};

export default function Home() {
  const [openCard, setOpenCard] = useState(null);
  const { casesSolved, casesTotal, score } = useSession();

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="wrap hero">
        <div className="hero__grid">
          <div>
            <p className="eyebrow">Case series BTD‑2041 · Educational simulation</p>
            <h1>
              Biomolecule
              <br />
              <span className="glow">Toxicity Detective</span>
            </h1>
            <p className="hero__sub">
              Something has gone wrong inside the cell. Follow the evidence. Identify the biomolecule.
              Solve the toxicity case.
            </p>

            <div className="hero__cta">
              <Link to="/cases" className="btn btn--key">
                Start investigation
                <Arrow size={15} className="btn__arrow" />
              </Link>
              <Link to="/biomolecules" className="btn">
                Open the biomolecule database
              </Link>
            </div>

            <div className="hero__stats">
              <div className="hero__stat">
                <b>{CASES.length}</b>
                <span>Case files</span>
              </div>
              <div className="hero__stat">
                <b>{BIOMOLECULES.length}</b>
                <span>Biomolecule classes</span>
              </div>
              <div className="hero__stat">
                <b>{MECHANISMS.length - 2}</b>
                <span>Mechanisms</span>
              </div>
              <div className="hero__stat">
                <b>{QUIZ.length}</b>
                <span>Quiz questions</span>
              </div>
            </div>
          </div>

          {/* Instrument-style readout. Illustrative, and says so. */}
          <aside className="panel panel--pad stack stack-4" aria-label="Specimen readout">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="eyebrow">Specimen panel</span>
              <span className="sim-tag">Illustrative</span>
            </div>
            <div className="stack stack-3">
              {BIOMOLECULES.map((bm) => {
                const r = READOUT[bm.id];
                return (
                  <Link
                    key={bm.id}
                    to={`/biomolecules#${bm.id}`}
                    data-channel={bm.id}
                    className="stack stack-2"
                    style={{ textDecoration: 'none' }}
                  >
                    <span
                      className="row"
                      style={{ justifyContent: 'space-between', gap: 'var(--s-2)' }}
                    >
                      <span
                        className="row"
                        style={{ gap: 8, color: 'var(--ink)', fontSize: 'var(--t-small)' }}
                      >
                        <span style={{ color: 'var(--channel)', display: 'flex' }}>
                          <Glyph name={bm.glyph} size={16} />
                        </span>
                        {bm.label}
                      </span>
                      <span className="note" style={{ color: 'var(--alert)' }}>
                        {r.marker}
                      </span>
                    </span>
                    <span className="meter">
                      <span className="meter__fill" style={{ width: `${r.integrity}%` }} />
                    </span>
                  </Link>
                );
              })}
            </div>
            <p className="note" style={{ borderTop: '1px solid var(--edge)', paddingTop: 'var(--s-3)' }}>
              Four classes of biomolecule, four ways for a cell to be damaged. Each case in this series
              points at exactly one of them.
            </p>
          </aside>
        </div>
      </section>

      {/* ------------------------------------------------------ the premise */}
      <section className="wrap stack stack-5" style={{ marginBottom: 'var(--s-8)' }}>
        <SectionHead eyebrow="Briefing" title="What you are looking for">
          <Link to="/mechanism-map" className="btn btn--ghost btn--sm">
            See the full mechanism chain
          </Link>
        </SectionHead>
        <p className="prose">
          Biomolecules such as proteins, lipids, carbohydrates, DNA and RNA are essential for cellular
          function. Toxic substances can interfere with these molecules through mechanisms such as
          enzyme inhibition, oxidative damage, denaturation and lipid peroxidation. Each mechanism
          leaves a different set of fingerprints — and reading those fingerprints, rather than the
          symptom at the end of the chain, is what this investigation trains.
        </p>

        <div className="bm-grid">
          {BIOMOLECULES.map((bm) => {
            const open = openCard === bm.id;
            return (
              <div key={bm.id} data-channel={bm.id} className="bm-card" aria-expanded={open}>
                <button
                  type="button"
                  onClick={() => setOpenCard(open ? null : bm.id)}
                  className="stack stack-3"
                  style={{ textAlign: 'left', padding: 0 }}
                  aria-expanded={open}
                >
                  <span className="bm-card__top">
                    <span style={{ color: 'var(--channel)', display: 'flex' }}>
                      <Glyph name={bm.glyph} size={26} />
                    </span>
                    <span>
                      <span className="bm-card__name" style={{ display: 'block' }}>
                        {bm.label}
                      </span>
                      <span className="bm-card__tag">{bm.tagline}</span>
                    </span>
                  </span>
                </button>

                {open && (
                  <div className="bm-card__body stack stack-3">
                    <p>{bm.summary}</p>
                    <div className="stack stack-2">
                      {bm.howToxicityHits.slice(0, 2).map((h) => (
                        <p key={h.title} style={{ fontSize: 'var(--t-small)' }}>
                          <b style={{ color: 'var(--ink)' }}>{h.title}. </b>
                          {h.body}
                        </p>
                      ))}
                    </div>
                    <Link to={`/biomolecules#${bm.id}`} className="btn btn--ghost btn--sm">
                      Full database entry
                      <Arrow size={13} className="btn__arrow" />
                    </Link>
                  </div>
                )}

                <span className="bm-card__more">
                  {open ? 'Hide' : 'How toxicity affects it'}{' '}
                  <ArrowDown
                    size={12}
                    style={{ verticalAlign: -2, transform: open ? 'rotate(180deg)' : 'none' }}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------- how it works */}
      <section className="wrap stack stack-5" style={{ marginBottom: 'var(--s-8)' }}>
        <SectionHead eyebrow="Procedure" title="How an investigation runs" />
        <div className="bm-grid">
          {[
            {
              n: '1',
              t: 'Open the evidence',
              d: 'Four evidence cards per case: a molecular observation, an experimental dataset, a structural clue about the biomolecule itself, and the effect on the cell. All four must be opened before you can submit.'
            },
            {
              n: '2',
              t: 'Read the data',
              d: 'Every case carries a simulated dose–response dataset. Hover any point for its value, or switch to the table. The direction a curve moves is usually the whole answer.'
            },
            {
              n: '3',
              t: 'Commit to a conclusion',
              d: 'Name the affected biomolecule and the mechanism. Correct answers unlock the full explanation and the causal pathway; wrong ones send you back to a specific piece of evidence.'
            }
          ].map((s) => (
            <div key={s.n} className="panel panel--pad stack stack-3">
              <span
                className="display"
                style={{ fontSize: '2.2rem', color: 'var(--ch-dna)', lineHeight: 1 }}
              >
                {s.n}
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', textTransform: 'uppercase' }}>
                {s.t}
              </h3>
              <p style={{ fontSize: 'var(--t-small)', color: 'var(--ink-2)' }}>{s.d}</p>
            </div>
          ))}
        </div>

        <div className="panel panel--pad row" style={{ justifyContent: 'space-between' }}>
          <div className="stack stack-2">
            <p className="eyebrow">Scoring</p>
            <div className="row" style={{ gap: 'var(--s-4)' }}>
              {RULE_TEXT.map((r) => (
                <span key={r.label} className="note">
                  {r.label} <b style={{ color: 'var(--ink)' }}>{r.value}</b>
                </span>
              ))}
            </div>
          </div>
          <div className="row" style={{ gap: 'var(--s-4)' }}>
            <span className="chip">
              Score <b style={{ color: 'var(--ink)', marginLeft: 4 }}>{score}</b>
            </span>
            <span className="chip">
              Solved{' '}
              <b style={{ color: 'var(--ink)', marginLeft: 4 }}>
                {casesSolved}/{casesTotal}
              </b>
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- case preview */}
      <section className="wrap stack stack-5" style={{ marginBottom: 'var(--s-7)' }}>
        <SectionHead eyebrow="Open case files" title="Six investigations">
          <Link to="/cases" className="btn btn--ghost btn--sm">
            View all case files
            <Arrow size={13} className="btn__arrow" />
          </Link>
        </SectionHead>
        <div className="case-grid">
          {CASES.slice(0, 3).map((c) => (
            <Link key={c.id} to={`/cases/${c.id}`} className="case-card" data-channel={c.channel}>
              <span className="case-card__num" aria-hidden="true">
                {c.number}
              </span>
              <div className="case-card__head">
                <div>
                  <p className="eyebrow">Case {c.number}</p>
                  <h3 className="case-card__title">{c.title}</h3>
                </div>
              </div>
              <p className="case-card__brief">{c.brief.slice(0, 145)}…</p>
              <div className="case-card__meta" style={{ gap: 'var(--s-4)' }}>
                <span>{c.difficulty}</span>
                <span>{c.evidence.length} evidence cards</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap stack stack-4">
        {casesSolved === casesTotal && casesTotal > 0 && (
          <div className="panel panel--pad row" style={{ justifyContent: 'space-between' }}>
            <span className="row" style={{ color: 'var(--ok)' }}>
              <Check /> All {casesTotal} cases solved.
            </span>
            <Link to="/debrief" className="btn btn--key btn--sm">
              View final debrief
              <Arrow size={13} className="btn__arrow" />
            </Link>
          </div>
        )}
        <Disclaimer />
      </section>
    </>
  );
}
