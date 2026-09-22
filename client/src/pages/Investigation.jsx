import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CASES, biomoleculeById, mechanismById } from '@shared/index.js';
import { fetchCase, fetchHint, submitCase } from '../lib/api.js';
import { useSession } from '../lib/session.jsx';
import { Arrow, Check, Cross, Glyph, Lock } from '../components/Glyphs.jsx';
import { Disclaimer, Readouts } from '../components/Bits.jsx';
import DoseChart from '../charts/DoseChart.jsx';
import Pathway from '../components/Pathway.jsx';

export default function Investigation() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const session = useSession();

  const [theCase, setCase] = useState(null);
  const [error, setError] = useState(null);

  const [opened, setOpened] = useState(() => new Set());
  const [selected, setSelected] = useState(null);
  const [justOpened, setJustOpened] = useState(null);

  const [biomolecule, setBiomolecule] = useState(null);
  const [mechanism, setMechanism] = useState(null);
  const [hints, setHints] = useState({});
  const [attempt, setAttempt] = useState(1);
  const [result, setResult] = useState(null);
  const [view, setView] = useState('board');
  const [busy, setBusy] = useState(false);

  const resultRef = useRef(null);
  const boardRef = useRef(null);

  /* Reset everything when the route changes to another case. */
  useEffect(() => {
    setCase(null);
    setError(null);
    setOpened(new Set());
    setSelected(null);
    setBiomolecule(null);
    setMechanism(null);
    setHints({});
    setAttempt(1);
    setResult(null);
    setView('board');
    window.scrollTo({ top: 0, behavior: 'auto' });

    let cancelled = false;
    fetchCase(caseId)
      .then((d) => !cancelled && setCase(d.case))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const index = CASES.findIndex((c) => c.id === caseId);
  const nextCase = index >= 0 ? CASES[index + 1] : null;
  const alreadySolved = Boolean(session.cases[caseId]?.solved);

  const datasets = useMemo(() => {
    if (!theCase) return {};
    return Object.fromEntries(theCase.datasets.map((d) => [d.id, d]));
  }, [theCase]);

  if (error) {
    return (
      <div className="wrap stack stack-4">
        <p className="empty">{error}</p>
        <Link to="/cases" className="btn btn--ghost btn--sm" style={{ alignSelf: 'center' }}>
          Back to the case files
        </Link>
      </div>
    );
  }

  if (!theCase) {
    return <p className="wrap empty">Retrieving case file…</p>;
  }

  const channel = theCase.channel;
  const allOpened = opened.size === theCase.evidence.length;
  const canSubmit = allOpened && biomolecule && mechanism && !busy;
  const activeEvidence = theCase.evidence.find((e) => e.id === selected) || null;

  const openEvidence = (id) => {
    setSelected(id);
    if (!opened.has(id)) {
      setOpened((prev) => new Set(prev).add(id));
      setJustOpened(id);
      window.setTimeout(() => setJustOpened(null), 950);
    }
  };

  const requestHint = async (field) => {
    if (hints[field]) return;
    const { hint } = await fetchHint(theCase.id, field, session.sessionId);
    setHints((prev) => ({ ...prev, [field]: hint }));
    session.noteHint(theCase.id);
  };

  const submit = async () => {
    setBusy(true);
    try {
      const hintsUsed = Object.keys(hints).length;
      const { result: graded } = await submitCase(
        theCase.id,
        { biomolecule, mechanism },
        { hintsUsed, attempt },
        session.sessionId
      );
      setResult(graded);
      session.noteAttempt(theCase.id, graded);
      setView('result');
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const tryAgain = () => {
    setAttempt((n) => n + 1);
    setResult(null);
    setView('board');
    if (!result?.biomoleculeCorrect) setBiomolecule(null);
    if (!result?.mechanismCorrect) setMechanism(null);
    window.setTimeout(() => boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  return (
    <div className="wrap stack stack-5" data-channel={channel}>
      {/* --------------------------------------------------- case header */}
      <header className="case-header" data-channel={channel}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="row" style={{ gap: 'var(--s-4)', alignItems: 'center' }}>
            <span className="case-header__num">#{theCase.number}</span>
            <div>
              <p className="eyebrow">{theCase.codename}</p>
              <h1 className="case-header__title">{theCase.title}</h1>
            </div>
          </div>
          <span className="status-live" data-state={alreadySolved ? 'solved' : 'active'}>
            <span className="pulse" />
            Status: {alreadySolved ? 'Case closed' : 'Investigation active'}
          </span>
        </div>

        <p className="prose" style={{ marginTop: 'var(--s-4)', color: 'var(--ink-2)' }}>
          {theCase.brief}
        </p>

        <dl className="case-header__meta">
          <div>
            <dt>Specimen</dt>
            <dd>{theCase.specimen}</dd>
          </div>
          <div>
            <dt>Exposure</dt>
            <dd>{theCase.exposure}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{theCase.duration}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{theCase.difficulty}</dd>
          </div>
        </dl>
      </header>

      {view === 'result' && result ? (
        /* =========================================================== result */
        <section ref={resultRef} className="verdict" data-solved={result.solved} data-channel={channel}>
          <div className="verdict__banner">
            <span className="verdict__mark">{result.solved ? <Check size={22} /> : <Cross size={20} />}</span>
            <div>
              <h2 className="verdict__title">
                {result.solved ? 'Case solved' : 'Investigation incomplete'}
              </h2>
              <p className="note">
                {result.solved
                  ? result.verdict
                  : 'Part of your conclusion does not fit the evidence. Nothing is lost — go back and look again.'}
              </p>
            </div>
            <span className="verdict__points">
              {result.points > 0 ? '+' : ''}
              {result.points} pts
            </span>
          </div>

          <div className="breakdown">
            {result.breakdown.map((b) => (
              <div className="breakdown__row" key={b.label}>
                <span>
                  {b.correct ? (
                    <Check size={13} style={{ verticalAlign: -2, color: 'var(--ok)' }} />
                  ) : (
                    <Cross size={13} style={{ verticalAlign: -2, color: 'var(--warn)' }} />
                  )}{' '}
                  {b.label}
                </span>
                <b>
                  {b.points > 0 ? '+' : ''}
                  {b.points}
                </b>
              </div>
            ))}
          </div>

          {result.solved ? (
            <>
              <div className="stack stack-3">
                <p className="subhead">Conclusion confirmed</p>
                <div className="row">
                  <span className="chip chip--channel" data-channel={result.correct.biomolecule}>
                    <Glyph name={biomoleculeById(result.correct.biomolecule).glyph} size={13} />
                    {biomoleculeById(result.correct.biomolecule).label}
                  </span>
                  <span className="chip chip--ok">
                    {mechanismById(result.correct.mechanism).label}
                  </span>
                </div>
              </div>

              <div className="stack stack-3">
                <p className="subhead">The mechanism</p>
                <div className="prose" style={{ maxWidth: '76ch' }}>
                  {result.explanation.split('\n\n').map((para) => (
                    <p key={para.slice(0, 40)}>{para}</p>
                  ))}
                </div>
              </div>

              <div className="stack stack-3">
                <p className="subhead">Causal pathway</p>
                <Pathway steps={result.pathway} />
              </div>

              <div className="stack stack-3">
                <p className="subhead">Terms from this case</p>
                <div className="terms">
                  {result.keyTerms.map((t) => (
                    <dl className="term" key={t.term}>
                      <dt>{t.term}</dt>
                      <dd>{t.def}</dd>
                    </dl>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="stack stack-3">
              <p className="subhead">Where to look again</p>
              <div className="stack stack-3">
                <div className="hint-box">
                  <b>Biomolecule. </b>
                  {result.feedback.biomolecule}
                </div>
                <div className="hint-box">
                  <b>Mechanism. </b>
                  {result.feedback.mechanism}
                </div>
              </div>
            </div>
          )}

          <div className="row" style={{ gap: 'var(--s-3)' }}>
            <button type="button" className="btn" onClick={() => setView('board')}>
              Review evidence
            </button>
            {!result.solved && (
              <button type="button" className="btn btn--key" onClick={tryAgain}>
                Try again
                <Arrow size={14} className="btn__arrow" />
              </button>
            )}
            {result.solved &&
              (nextCase ? (
                <button
                  type="button"
                  className="btn btn--key"
                  onClick={() => navigate(`/cases/${nextCase.id}`)}
                >
                  Next case: {nextCase.title}
                  <Arrow size={14} className="btn__arrow" />
                </button>
              ) : (
                <Link to="/debrief" className="btn btn--key">
                  Final debrief
                  <Arrow size={14} className="btn__arrow" />
                </Link>
              ))}
            <Link to="/cases" className="btn btn--ghost">
              All case files
            </Link>
          </div>
        </section>
      ) : (
        /* ============================================================ board */
        <div className="invest" ref={boardRef}>
          <div className="stack stack-5">
            {result && (
              <div className="panel panel--pad row" style={{ justifyContent: 'space-between' }}>
                <span className="note">
                  {result.solved ? 'This case is closed.' : 'Your last conclusion did not fit the evidence.'}
                </span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setView('result')}>
                  Back to the result
                </button>
              </div>
            )}

            <section className="stack stack-4">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Evidence board</p>
                  <h2 className="display" style={{ fontSize: 'var(--t-h2)', marginTop: 4 }}>
                    Open every card
                  </h2>
                </div>
              </div>

              <div className="ev-progress">
                <span className="note">
                  Evidence discovered: {opened.size}/{theCase.evidence.length}
                </span>
                <span className="ev-progress__track">
                  <span
                    className="ev-progress__fill"
                    style={{ width: `${(opened.size / theCase.evidence.length) * 100}%` }}
                  />
                </span>
              </div>

              <div className="ev-grid">
                {theCase.evidence.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    className="ev-card"
                    data-open={opened.has(ev.id)}
                    onClick={() => openEvidence(ev.id)}
                    aria-pressed={selected === ev.id}
                  >
                    {justOpened === ev.id && <span className="ev-card__scan" aria-hidden="true" />}
                    <span className="ev-card__id">Evidence {ev.id}</span>
                    <span className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: opened.has(ev.id) ? 'var(--channel)' : 'var(--ink-4)', display: 'flex' }}>
                        <Glyph name={ev.icon} size={20} />
                      </span>
                      <span className="ev-card__kind">{ev.kind}</span>
                    </span>
                    <span className="ev-card__lock">
                      {opened.has(ev.id) ? (
                        selected === ev.id ? (
                          'Now reading'
                        ) : (
                          'Read — open again'
                        )
                      ) : (
                        <>
                          <Lock size={12} style={{ verticalAlign: -2 }} /> Unread
                        </>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {activeEvidence ? (
              <section className="ev-detail" aria-live="polite">
                <div>
                  <p className="eyebrow">
                    Evidence {activeEvidence.id} · {activeEvidence.kind}
                  </p>
                  <h3 className="ev-detail__title" style={{ marginTop: 6 }}>
                    {activeEvidence.title}
                  </h3>
                </div>
                <p className="ev-detail__body">{activeEvidence.body}</p>

                {activeEvidence.readouts && <Readouts items={activeEvidence.readouts} />}

                {activeEvidence.datasetId && datasets[activeEvidence.datasetId] && (
                  <DoseChart dataset={datasets[activeEvidence.datasetId]} />
                )}
                {activeEvidence.secondaryDatasetId && datasets[activeEvidence.secondaryDatasetId] && (
                  <DoseChart dataset={datasets[activeEvidence.secondaryDatasetId]} />
                )}
              </section>
            ) : (
              <section className="locked">
                <p className="eyebrow">Evidence viewer</p>
                <p className="note">
                  Select a card above to read it. All four must be opened before a conclusion can be
                  submitted — this investigation does not accept guesses from the file cover.
                </p>
              </section>
            )}
          </div>

          {/* --------------------------------------------------- conclusion */}
          <aside className="invest__side">
            <div className="conclusion" data-channel={channel}>
              <div>
                <p className="eyebrow">Your conclusion</p>
                <h2 className="display" style={{ fontSize: '1.5rem', marginTop: 4 }}>
                  Name the lesion
                </h2>
              </div>

              {!allOpened ? (
                <div className="locked">
                  <span className="row" style={{ color: 'var(--ink-3)', gap: 8 }}>
                    <Lock /> Locked
                  </span>
                  <p className="note">
                    {theCase.evidence.length - opened.size} evidence card
                    {theCase.evidence.length - opened.size === 1 ? '' : 's'} still unread. Open them all
                    to unlock the conclusion form.
                  </p>
                </div>
              ) : (
                <>
                  <QuestionBlock
                    label="Question 1"
                    prompt={theCase.questions.biomolecule.prompt}
                    options={theCase.questions.biomolecule.options.map((id) => {
                      const bm = biomoleculeById(id);
                      return { id, label: bm.label, channel: id, icon: bm.glyph };
                    })}
                    value={biomolecule}
                    onChange={setBiomolecule}
                    hint={hints.biomolecule}
                    onHint={() => requestHint('biomolecule')}
                    disabled={Boolean(result)}
                  />

                  <hr className="rule" />

                  <QuestionBlock
                    label="Question 2"
                    prompt={theCase.questions.mechanism.prompt}
                    options={theCase.questions.mechanism.options.map((id) => {
                      const m = mechanismById(id);
                      return { id, label: m.label, channel: m.biomolecule };
                    })}
                    value={mechanism}
                    onChange={setMechanism}
                    hint={hints.mechanism}
                    onHint={() => requestHint('mechanism')}
                    disabled={Boolean(result)}
                  />

                  <button
                    type="button"
                    className="btn btn--key btn--wide"
                    disabled={!canSubmit}
                    onClick={submit}
                  >
                    {busy ? 'Checking…' : 'Submit conclusion'}
                  </button>
                  <p className="note">
                    Attempt {attempt} · {Object.keys(hints).length} hint
                    {Object.keys(hints).length === 1 ? '' : 's'} used · correct biomolecule +50,
                    correct mechanism +50, each hint −10
                  </p>
                </>
              )}
            </div>

            <div style={{ marginTop: 'var(--s-4)' }}>
              <Disclaimer compact />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function QuestionBlock({ label, prompt, options, value, onChange, hint, onHint, disabled }) {
  return (
    <div className="q-block">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="eyebrow">{label}</span>
        {!hint && !disabled && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onHint}>
            Hint −10
          </button>
        )}
      </div>
      <p className="q-block__prompt">{prompt}</p>
      {hint && <div className="hint-box">{hint}</div>}
      <div className="q-options">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className="opt"
            data-channel={o.channel}
            aria-pressed={value === o.id}
            disabled={disabled}
            onClick={() => onChange(o.id)}
          >
            <span className="opt__marker" aria-hidden="true" />
            {o.icon && (
              <span style={{ color: 'var(--channel)', display: 'flex' }}>
                <Glyph name={o.icon} size={15} />
              </span>
            )}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
