/**
 * session.jsx — the investigation state, shared by every page.
 *
 * Holds the detective score, which cases are solved, how many hints were spent
 * and the quiz result. The browser keeps a copy in localStorage so a refresh
 * does not wipe progress; when the API is reachable the server keeps the
 * authoritative copy and this mirrors it.
 *
 * localStorage access is wrapped because it throws in private-browsing modes
 * and returns nothing when site data has been cleared. The app has to work
 * either way, so a failed read is treated as "no progress yet", never an error.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CASES } from '@shared/index.js';
import { detectMode, getMode, onModeChange, fetchProgress, resetProgress } from './api.js';

const KEY = 'btd.session.v1';
const ID_KEY = 'btd.sessionId.v1';

const SessionContext = createContext(null);

const emptyState = () => ({
  score: 0,
  cases: {}, // caseId -> { solved, attempts, hintsUsed, points }
  quiz: null,
  startedAt: Date.now()
});

function readStore(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeStore(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or blocked storage — progress simply won't survive a reload */
  }
}

function makeId() {
  try {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return 'btd-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function SessionProvider({ children }) {
  const [sessionId] = useState(() => {
    const existing = readStore(ID_KEY, null);
    if (existing) return existing;
    const fresh = makeId();
    writeStore(ID_KEY, fresh);
    return fresh;
  });

  const [state, setState] = useState(() => readStore(KEY, emptyState()));
  const [mode, setModeState] = useState(getMode());

  useEffect(() => {
    detectMode().then(setModeState);
    return onModeChange(setModeState);
  }, []);

  // When the API is live, pull the server's record once and MERGE it with what
  // this browser already has. Merge, not replace — deliberately.
  //
  // On a serverless host (Vercel) each request may hit a fresh instance, so the
  // server's in-memory store can legitimately hold only part of the history, or
  // none of it. Assigning `session.score` straight onto state would then make a
  // player's score visibly drop on refresh, which is the single worst thing a
  // scoreboard can do. So: union the solved cases, and never let the total go
  // backwards.
  useEffect(() => {
    if (mode !== 'api') return;
    let cancelled = false;
    fetchProgress(sessionId)
      .then(({ session }) => {
        if (cancelled || !session) return;
        const hasServerProgress = session.casesSolved > 0 || session.quiz;
        if (!hasServerProgress) return;

        setState((prev) => {
          const cases = { ...prev.cases };
          for (const [id, remote] of Object.entries(session.cases || {})) {
            const local = cases[id];
            const remoteIsBetter =
              !local ||
              (!local.solved && remote.solved) ||
              (remote.points || 0) > (local.points || 0);
            cases[id] = remoteIsBetter ? { ...local, ...remote } : local;
          }

          const quiz = session.quiz
            ? { score: session.quiz.score, total: session.quiz.total, points: session.quiz.points }
            : prev.quiz;

          const casePoints = Object.values(cases).reduce(
            (n, c) => n + (c.solved ? c.points || 0 : 0),
            0
          );
          const merged = casePoints + (quiz?.points || 0);

          return { ...prev, score: Math.max(prev.score, merged), cases, quiz };
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mode, sessionId]);

  useEffect(() => writeStore(KEY, state), [state]);

  const noteHint = useCallback((caseId) => {
    setState((prev) => {
      const entry = prev.cases[caseId] || { solved: false, attempts: 0, hintsUsed: 0, points: 0 };
      return {
        ...prev,
        cases: { ...prev.cases, [caseId]: { ...entry, hintsUsed: entry.hintsUsed + 1 } }
      };
    });
  }, []);

  const noteAttempt = useCallback((caseId, result) => {
    setState((prev) => {
      const entry = prev.cases[caseId] || { solved: false, attempts: 0, hintsUsed: 0, points: 0 };
      const alreadySolved = entry.solved;
      const next = {
        ...entry,
        attempts: entry.attempts + 1,
        solved: alreadySolved || result.solved,
        points: alreadySolved ? entry.points : result.solved ? result.points : entry.points
      };
      return {
        ...prev,
        // Points bank once per case, so replaying a solved case cannot farm score.
        score: !alreadySolved && result.solved ? prev.score + result.points : prev.score,
        cases: { ...prev.cases, [caseId]: next }
      };
    });
  }, []);

  const noteQuiz = useCallback((result) => {
    setState((prev) => ({
      ...prev,
      score: prev.score - (prev.quiz?.points || 0) + result.points,
      quiz: { score: result.score, total: result.total, points: result.points }
    }));
  }, []);

  const reset = useCallback(() => {
    setState(emptyState());
    resetProgress(sessionId).catch(() => {});
  }, [sessionId]);

  const value = useMemo(() => {
    const solvedIds = CASES.filter((c) => state.cases[c.id]?.solved).map((c) => c.id);
    const attempts = Object.values(state.cases).reduce((n, c) => n + (c.attempts || 0), 0);
    const correctParts = Object.values(state.cases).filter((c) => c.solved).length;
    return {
      sessionId,
      mode,
      score: state.score,
      cases: state.cases,
      quiz: state.quiz,
      solvedIds,
      casesSolved: solvedIds.length,
      casesTotal: CASES.length,
      hintsUsed: Object.values(state.cases).reduce((n, c) => n + (c.hintsUsed || 0), 0),
      attempts,
      accuracy: attempts ? Math.round((correctParts / attempts) * 100) : null,
      allSolved: solvedIds.length === CASES.length,
      noteHint,
      noteAttempt,
      noteQuiz,
      reset
    };
  }, [sessionId, mode, state, noteHint, noteAttempt, noteQuiz, reset]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>.');
  return ctx;
}
