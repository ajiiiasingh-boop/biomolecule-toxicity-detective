import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchQuiz, submitQuiz } from '../lib/api.js';
import { useSession } from '../lib/session.jsx';
import { Arrow, Check, Cross } from '../components/Glyphs.jsx';
import { Disclaimer, PageHead } from '../components/Bits.jsx';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const session = useSession();
  const resultRef = useRef(null);

  useEffect(() => {
    fetchQuiz().then((d) => setQuestions(d.questions));
  }, []);

  if (!questions.length) return <p className="wrap empty">Loading the quiz…</p>;

  const q = questions[index];
  const answered = Object.keys(answers).length;
  const complete = answered === questions.length;

  const choose = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
    if (index < questions.length - 1) {
      window.setTimeout(() => setIndex((i) => i + 1), 220);
    }
  };

  const submit = async () => {
    setBusy(true);
    try {
      const { result: graded } = await submitQuiz(answers, session.sessionId);
      setResult(graded);
      session.noteQuiz(graded);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    } finally {
      setBusy(false);
    }
  };

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (result) {
    const wrong = result.results.filter((r) => !r.correct);
    return (
      <div className="wrap stack stack-6" ref={resultRef}>
        <PageHead eyebrow="Quick quiz · Result" title="Marked" />

        <div className="panel score-hero">
          <div>
            <span className="score-hero__big">
              {result.score}/{result.total}
            </span>
            <p className="eyebrow" style={{ marginTop: 8 }}>
              Your score
            </p>
          </div>
          <div className="stat-grid" style={{ flex: '1 1 320px' }}>
            <div className="stat">
              <b>{result.percentage}%</b>
              <span>Accuracy</span>
            </div>
            <div className="stat">
              <b>+{result.points}</b>
              <span>Points added</span>
            </div>
            <div className="stat">
              <b>{session.score}</b>
              <span>Detective score</span>
            </div>
          </div>
        </div>

        <section className="stack stack-4">
          <p className="subhead">
            {wrong.length === 0
              ? 'Every answer correct — full marks'
              : `Review · ${wrong.length} to revisit`}
          </p>
          <div className="quiz-review">
            {result.results.map((r, i) => (
              <article className="review-item" data-correct={r.correct} key={r.id}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4>
                    {i + 1}. {r.question}
                  </h4>
                  <span className={r.correct ? 'chip chip--ok' : 'chip chip--warn'}>
                    {r.correct ? <Check size={12} /> : <Cross size={12} />}
                    {r.correct ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                {!r.correct && (
                  <p className="note" style={{ textTransform: 'none', letterSpacing: 0, marginBottom: 8 }}>
                    You chose: {r.chosen === null ? 'nothing' : r.options[r.chosen]} · Correct answer:{' '}
                    <b style={{ color: 'var(--ink)' }}>{r.options[r.answer]}</b>
                  </p>
                )}
                <p style={{ fontSize: 'var(--t-small)', color: 'var(--ink-2)' }}>{r.explanation}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="row">
          <button type="button" className="btn btn--key" onClick={restart}>
            Retake the quiz
          </button>
          <Link to="/cases" className="btn">
            Back to the case files
            <Arrow size={14} className="btn__arrow" />
          </Link>
          <Link to="/debrief" className="btn btn--ghost">
            Investigation debrief
          </Link>
        </div>

        <Disclaimer compact />
      </div>
    );
  }

  return (
    <div className="wrap stack stack-6">
      <PageHead
        eyebrow="Quick quiz"
        title="Ten questions"
        lede="Covering biomolecules, oxidative stress, enzyme inhibition, protein denaturation, DNA damage, lipid peroxidation and their cellular consequences. Each correct answer adds 10 to your detective score, and every question is explained at the end."
      />

      <div className="quiz-card">
        <div className="quiz-meter" aria-hidden="true">
          {questions.map((question, i) => (
            <i
              key={question.id}
              data-state={answers[question.id] !== undefined ? 'done' : i === index ? 'current' : 'todo'}
            />
          ))}
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="eyebrow">
            Question {index + 1} of {questions.length}
          </span>
          <span className="chip">{q.topic}</span>
        </div>

        <p className="quiz-q">{q.question}</p>

        <div className="q-options">
          {q.options.map((opt, i) => (
            <button
              key={opt}
              type="button"
              className="opt"
              data-channel="dna-rna"
              aria-pressed={answers[q.id] === i}
              onClick={() => choose(i)}
            >
              <span className="opt__marker" aria-hidden="true" />
              {opt}
            </button>
          ))}
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="row" style={{ gap: 'var(--s-2)' }}>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={index === questions.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              Next
            </button>
          </div>
          <span className="note">
            {answered}/{questions.length} answered
          </span>
        </div>

        <button
          type="button"
          className="btn btn--key btn--wide"
          disabled={!complete || busy}
          onClick={submit}
        >
          {busy ? 'Marking…' : complete ? 'Submit answers' : `Answer all ${questions.length} to submit`}
        </button>
      </div>

      <Disclaimer compact />
    </div>
  );
}
