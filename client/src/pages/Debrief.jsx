import { Link } from 'react-router-dom';
import { CASES, mechanismById, biomoleculeById, RULE_TEXT } from '@shared/index.js';
import { useSession } from '../lib/session.jsx';
import { Arrow, Check, Glyph, Lock } from '../components/Glyphs.jsx';
import { Disclaimer, PageHead } from '../components/Bits.jsx';

/**
 * The end-of-series summary. It reports the player's own record only —
 * no comparison against other players, because there is nothing useful to
 * learn from a rank here and plenty to lose.
 */
export default function Debrief() {
  const { score, cases, quiz, casesSolved, casesTotal, hintsUsed, attempts, accuracy, allSolved, reset } =
    useSession();

  const solvedCases = CASES.filter((c) => cases[c.id]?.solved);
  const mechanismsFound = solvedCases.map((c) => c.solution?.mechanism).filter(Boolean);

  return (
    <div className="wrap stack stack-6">
      <PageHead
        eyebrow="Debrief"
        title={allSolved ? 'Investigation complete' : 'Investigation in progress'}
        lede={
          allSolved
            ? 'Every case in series BTD‑2041 is closed. Here is the record of how you closed them.'
            : 'Your record so far. Cases can be worked in any order, and an unsolved case can be reopened at any time.'
        }
      />

      <section className="panel score-hero">
        <div>
          <span className="score-hero__big">{score}</span>
          <p className="eyebrow" style={{ marginTop: 8 }}>
            Detective score
          </p>
        </div>
        <div className="stat-grid" style={{ flex: '1 1 380px' }}>
          <div className="stat">
            <b>
              {casesSolved}/{casesTotal}
            </b>
            <span>Cases solved</span>
          </div>
          <div className="stat">
            <b>{accuracy === null ? '—' : `${accuracy}%`}</b>
            <span>Conclusion accuracy</span>
          </div>
          <div className="stat">
            <b>{hintsUsed}</b>
            <span>Hints used</span>
          </div>
          <div className="stat">
            <b>{quiz ? `${quiz.score}/${quiz.total}` : '—'}</b>
            <span>Quiz result</span>
          </div>
        </div>
      </section>

      <section className="stack stack-4">
        <p className="subhead">Case record</p>
        <div className="tick-list">
          {CASES.map((c) => {
            const state = cases[c.id];
            return (
              <Link key={c.id} to={`/cases/${c.id}`} className="tick" data-done={Boolean(state?.solved)}>
                <span className="tick__mark">
                  {state?.solved ? <Check size={12} /> : <Lock size={11} />}
                </span>
                <span>
                  <b style={{ fontWeight: 600 }}>
                    Case {c.number} · {c.title}
                  </b>
                </span>
                <span className="tick__tail">
                  {state?.solved
                    ? `${state.points} pts · ${state.attempts} attempt${state.attempts > 1 ? 's' : ''}`
                    : state?.attempts
                      ? `${state.attempts} attempt${state.attempts > 1 ? 's' : ''}, open`
                      : 'Not started'}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="stack stack-4">
        <p className="subhead">Mechanisms identified</p>
        {mechanismsFound.length === 0 ? (
          <p className="note">None yet. Solve a case to add its mechanism here.</p>
        ) : (
          <div className="stack stack-3">
            {mechanismsFound.map((id) => {
              const m = mechanismById(id);
              const bm = biomoleculeById(m.biomolecule);
              return (
                <div className="mech-item" key={id} data-channel={m.biomolecule}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <h4>{m.label}</h4>
                    <span className="chip chip--channel" data-channel={m.biomolecule}>
                      <Glyph name={bm.glyph} size={13} />
                      {bm.label}
                    </span>
                  </div>
                  <p>{m.oneLine}</p>
                  <p className="note" style={{ marginTop: 6, textTransform: 'none', letterSpacing: 0 }}>
                    Tell: {m.tell}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel panel--pad stack stack-3">
        <p className="eyebrow">How the score was built</p>
        <div className="row" style={{ gap: 'var(--s-5)' }}>
          {RULE_TEXT.map((r) => (
            <span key={r.label} className="note">
              {r.label} <b style={{ color: 'var(--ink)' }}>{r.value}</b>
            </span>
          ))}
        </div>
        <p className="note" style={{ maxWidth: '64ch' }}>
          Points bank once per case, so replaying a solved case will not raise the score. There is no
          leaderboard: this record is yours and is not compared with anyone else.
        </p>
      </section>

      <div className="row">
        {!allSolved && (
          <Link to="/cases" className="btn btn--key">
            Continue investigating
            <Arrow size={14} className="btn__arrow" />
          </Link>
        )}
        {!quiz && (
          <Link to="/quiz" className="btn">
            Take the quick quiz
          </Link>
        )}
        <button type="button" className="btn btn--ghost" onClick={reset}>
          Reset progress
        </button>
      </div>

      <Disclaimer />
    </div>
  );
}
