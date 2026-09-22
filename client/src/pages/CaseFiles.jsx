import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCases } from '../lib/api.js';
import { useSession } from '../lib/session.jsx';
import { Arrow, Check, Glyph } from '../components/Glyphs.jsx';
import { ChannelChip, Disclaimer, PageHead } from '../components/Bits.jsx';
import { biomoleculeById } from '@shared/index.js';

export default function CaseFiles() {
  const [cases, setCases] = useState([]);
  const [error, setError] = useState(null);
  const { cases: progress, casesSolved, casesTotal, score, allSolved } = useSession();

  useEffect(() => {
    fetchCases()
      .then((d) => setCases(d.cases))
      .catch((e) => setError(e.message));
  }, []);

  const pct = casesTotal ? Math.round((casesSolved / casesTotal) * 100) : 0;

  return (
    <div className="wrap stack stack-6">
      <PageHead
        eyebrow="Case files"
        title="Select an investigation"
        lede="Six fictional cases, each built around a different way a toxicant can damage a biomolecule. They can be worked in any order, though the later ones assume you have met the earlier mechanisms."
      />

      <div className="panel panel--pad stack stack-4">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="eyebrow">Investigation progress</span>
          <span className="note">
            Detective score <b style={{ color: 'var(--ink)' }}>{score}</b>
          </span>
        </div>
        <div className="ev-progress">
          <span className="note">
            {casesSolved} of {casesTotal} solved
          </span>
          <span className="ev-progress__track">
            <span className="ev-progress__fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="note">{pct}%</span>
        </div>
        {allSolved && (
          <Link to="/debrief" className="btn btn--key btn--sm" style={{ alignSelf: 'flex-start' }}>
            All cases closed — open the debrief
            <Arrow size={13} className="btn__arrow" />
          </Link>
        )}
      </div>

      {error && <p className="empty">Could not load the case files: {error}</p>}

      <div className="case-grid">
        {cases.map((c) => {
          const state = progress[c.id];
          const bm = biomoleculeById(c.channel);
          return (
            <Link key={c.id} to={`/cases/${c.id}`} className="case-card" data-channel={c.channel}>
              <span className="case-card__num" aria-hidden="true">
                {c.number}
              </span>
              <div className="case-card__head">
                <div>
                  <p className="eyebrow">
                    Case {c.number} · {c.codename}
                  </p>
                  <h3 className="case-card__title">{c.title}</h3>
                </div>
                <span style={{ color: 'var(--channel)', display: 'flex', flex: 'none' }}>
                  <Glyph name={bm?.glyph || 'search'} size={24} />
                </span>
              </div>

              <p className="case-card__brief">{c.brief}</p>

              {/* No interpunct separators: when the row wraps, a dangling "·"
                  is left stranded at the end of a line. Gap does the job. */}
              <div className="case-card__meta" style={{ gap: 'var(--s-4)' }}>
                <span>{c.difficulty}</span>
                <span>{c.duration} exposure</span>
                <span>{c.evidenceCount} evidence cards</span>
              </div>

              <div className="case-card__foot">
                {state?.solved ? (
                  <span className="chip chip--ok">
                    <Check size={13} /> Solved · {state.points} pts
                  </span>
                ) : state?.attempts ? (
                  <span className="chip chip--warn">
                    In progress · {state.attempts} attempt{state.attempts > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="chip">Unopened</span>
                )}
                <span className="note" style={{ color: 'var(--ink-2)' }}>
                  {state?.solved ? 'Review' : 'Investigate'} <Arrow size={12} style={{ verticalAlign: -2 }} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Spoiler-safe: shows only which classes exist, not which case is which. */}
      <div className="panel panel--pad stack stack-3">
        <p className="eyebrow">Answer space</p>
        <p className="note" style={{ maxWidth: '62ch' }}>
          Every case resolves to one of these four biomolecule classes and to one named mechanism.
          Which case is which is the part you work out.
        </p>
        <div className="row">
          {['dna-rna', 'protein', 'lipid', 'carbohydrate'].map((id) => (
            <ChannelChip key={id} id={id} />
          ))}
        </div>
      </div>

      <Disclaimer compact />
    </div>
  );
}
