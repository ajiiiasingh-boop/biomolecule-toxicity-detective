/**
 * store.js — in-memory session progress.
 *
 * A Map keyed by a client-generated session id. Deliberately not a database:
 * the project has no login, the data is worthless if lost, and requiring a
 * database install would stop the project running on a marker's machine in
 * one command. Sessions idle for longer than SESSION_TTL_MS are swept so a
 * long-running server cannot grow without bound.
 *
 * Swapping this for a real database means reimplementing these six functions
 * against it; nothing else in the server touches session state.
 */

const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const MAX_SESSIONS = 5000;

const sessions = new Map();

function blankSession(id) {
  return {
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    score: 0,
    hintsUsed: 0,
    attempts: 0,
    cases: {}, // caseId -> { solved, attempts, hintsUsed, points, biomoleculeCorrect, mechanismCorrect }
    quiz: null // { score, total, points, takenAt }
  };
}

function sweep() {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [id, s] of sessions) {
    if (s.updatedAt < cutoff) sessions.delete(id);
  }
  // Hard cap as a second line of defence against unbounded growth.
  if (sessions.size > MAX_SESSIONS) {
    const oldest = [...sessions.entries()].sort((a, b) => a[1].updatedAt - b[1].updatedAt);
    for (let i = 0; i < oldest.length - MAX_SESSIONS; i += 1) sessions.delete(oldest[i][0]);
  }
}

export function getSession(id) {
  if (!id) return null;
  sweep();
  if (!sessions.has(id)) sessions.set(id, blankSession(id));
  return sessions.get(id);
}

export function recordHint(id, caseId) {
  const s = getSession(id);
  if (!s) return null;
  const entry = (s.cases[caseId] ||= { solved: false, attempts: 0, hintsUsed: 0, points: 0 });
  entry.hintsUsed += 1;
  s.hintsUsed += 1;
  s.updatedAt = Date.now();
  return s;
}

export function recordSolve(id, caseId, result) {
  const s = getSession(id);
  if (!s) return null;
  const entry = (s.cases[caseId] ||= { solved: false, attempts: 0, hintsUsed: 0, points: 0 });
  entry.attempts += 1;
  s.attempts += 1;
  entry.biomoleculeCorrect = result.biomoleculeCorrect;
  entry.mechanismCorrect = result.mechanismCorrect;
  // A case can only bank points once; re-solving an already-solved case does
  // not farm the score.
  if (result.solved && !entry.solved) {
    entry.solved = true;
    entry.points = result.points;
    entry.solvedAt = Date.now();
    s.score += result.points;
  }
  s.updatedAt = Date.now();
  return s;
}

export function recordQuiz(id, result) {
  const s = getSession(id);
  if (!s) return null;
  const previous = s.quiz?.points || 0;
  // Retaking replaces the old quiz score rather than stacking on top of it.
  s.score = s.score - previous + result.points;
  s.quiz = { score: result.score, total: result.total, points: result.points, takenAt: Date.now() };
  s.updatedAt = Date.now();
  return s;
}

export function resetSession(id) {
  if (!id) return null;
  sessions.set(id, blankSession(id));
  return sessions.get(id);
}

export function sessionCount() {
  return sessions.size;
}
