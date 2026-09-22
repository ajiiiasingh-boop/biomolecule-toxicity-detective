/**
 * api.js — the only place the client talks to the server.
 *
 * Every call has two implementations: one that hits the REST API, and one
 * that computes the same answer locally from the bundled shared data layer.
 * On startup the client probes /api/health once; if the API answers, it is
 * used for everything, and if it does not, the app silently runs on the local
 * implementation instead.
 *
 * Why bother: the project has to do two jobs. Run `npm run dev` and it is a
 * real client/server application with server-side answer checking. Open the
 * standalone build (or the hosted demo) and there is no server at all, but the
 * site still has to work. Rather than writing the app twice, every call is
 * declared once as a pair.
 */

import {
  CASES,
  caseById,
  publicCase,
  caseSummary,
  BIOMOLECULES,
  biomoleculeById,
  MECHANISMS,
  MECHANISM_MAP,
  CELL_MAP,
  TOXIN_CATEGORIES,
  QUIZ,
  publicQuestion,
  gradeCase,
  gradeQuiz,
  SCORE_RULES,
  RULE_TEXT,
  PROJECT
} from '@shared/index.js';

/* eslint-disable no-undef */
const FORCED_OFFLINE = typeof __STANDALONE__ !== 'undefined' && __STANDALONE__;
/* eslint-enable no-undef */

const listeners = new Set();
let mode = FORCED_OFFLINE ? 'offline' : 'connecting';

export const getMode = () => mode;
export function onModeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function setMode(next) {
  if (mode === next) return;
  mode = next;
  listeners.forEach((fn) => fn(next));
}

/**
 * Probes the API once. Resolves to 'api' or 'offline'; never throws.
 *
 * The body is checked, not just the status. A static host (GitHub Pages,
 * Netlify, Vercel) answers unknown paths with the SPA's index.html and a 200,
 * so a status-only check would conclude the API is live and then fail on every
 * real call. Requiring `status: "ok"` in JSON makes the probe honest.
 */
export async function detectMode() {
  if (FORCED_OFFLINE) return 'offline';
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('./api/health', { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      setMode('offline');
      return mode;
    }
    const body = await res.json();
    setMode(body?.status === 'ok' ? 'api' : 'offline');
  } catch {
    setMode('offline');
  }
  return mode;
}

/* Relative, for the same reason the Vite base is relative: if the whole app is
   served from a subfolder, the API sits under that subfolder too. HashRouter
   keeps the document path stable, so './api/...' always resolves correctly. */
async function request(path, options) {
  const res = await fetch('./api' + path, {
    headers: { 'content-type': 'application/json' },
    ...options
  });
  const body = await res.json();
  if (!res.ok) {
    const err = new Error(body?.error?.message || `Request failed (${res.status})`);
    err.code = body?.error?.code;
    err.details = body?.error?.details;
    err.status = res.status;
    throw err;
  }
  return body;
}

/**
 * Runs the API implementation when the API is reachable, and falls back to the
 * local one if the network call fails for a transport reason. A 4xx from the
 * server is a real answer and is rethrown — falling back there would hide bugs.
 */
async function call(remote, local) {
  if (mode === 'offline') return local();
  try {
    return await remote();
  } catch (err) {
    if (err.status >= 400 && err.status < 500) throw err;
    setMode('offline');
    return local();
  }
}

/* --------------------------------------------------------------- content */

export const fetchMeta = () =>
  call(
    () => request('/meta'),
    () => ({
      project: PROJECT,
      scoreRules: SCORE_RULES,
      scoreRuleText: RULE_TEXT,
      counts: {
        cases: CASES.length,
        biomolecules: BIOMOLECULES.length,
        mechanisms: MECHANISMS.length,
        toxinCategories: TOXIN_CATEGORIES.length
      }
    })
  );

export const fetchCases = () =>
  call(
    () => request('/cases'),
    () => ({ cases: CASES.map(caseSummary) })
  );

export const fetchCase = (id) =>
  call(
    () => request(`/cases/${id}`),
    () => {
      const found = caseById(id);
      if (!found) {
        const err = new Error(`No case with id "${id}".`);
        err.status = 404;
        throw err;
      }
      return { case: publicCase(found) };
    }
  );

export const fetchHint = (id, field, sessionId) =>
  call(
    () => request(`/cases/${id}/hint`, { method: 'POST', body: JSON.stringify({ field, sessionId }) }),
    () => ({ caseId: id, field, hint: caseById(id).solution.hints[field], cost: 10, session: null })
  );

export const submitCase = (id, answer, context, sessionId) =>
  call(
    () =>
      request(`/cases/${id}/solve`, {
        method: 'POST',
        body: JSON.stringify({ ...answer, ...context, sessionId })
      }),
    () => ({ result: gradeCase(caseById(id), answer, context), session: null })
  );

export const fetchBiomolecules = () =>
  call(
    () => request('/biomolecules'),
    () => ({ biomolecules: BIOMOLECULES })
  );

export const fetchBiomolecule = (id) =>
  call(
    () => request(`/biomolecules/${id}`),
    () => ({ biomolecule: biomoleculeById(id) })
  );

export const fetchMechanisms = () =>
  call(
    () => request('/mechanisms'),
    () => ({ mechanisms: MECHANISMS })
  );

export const fetchMechanismMap = () =>
  call(
    () => request('/mechanism-map'),
    () => ({ mechanismMap: MECHANISM_MAP })
  );

export const fetchCellMap = () =>
  call(
    () => request('/cell-map'),
    () => ({ cellMap: CELL_MAP })
  );

export const fetchToxins = () =>
  call(
    () => request('/toxins'),
    () => ({ categories: TOXIN_CATEGORIES })
  );

/* ------------------------------------------------------------------ quiz */

export const fetchQuiz = () =>
  call(
    () => request('/quiz'),
    () => ({ questions: QUIZ.map(publicQuestion), total: QUIZ.length, pointsPerCorrect: 10 })
  );

export const submitQuiz = (answers, sessionId) =>
  call(
    () => request('/quiz/submit', { method: 'POST', body: JSON.stringify({ answers, sessionId }) }),
    () => ({ result: gradeQuiz(QUIZ, answers), session: null })
  );

/* -------------------------------------------------------------- progress */

export const fetchProgress = (sessionId) =>
  call(
    () => request(`/progress/${sessionId}`),
    () => ({ session: null })
  );

export const resetProgress = (sessionId) =>
  call(
    () => request(`/progress/${sessionId}/reset`, { method: 'POST', body: '{}' }),
    () => ({ session: null, reset: true })
  );
