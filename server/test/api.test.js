/**
 * api.test.js — API test suite.
 *
 * Uses node:test and the built-in fetch, so there is no test framework to
 * install. The app is started on an ephemeral port, driven over real HTTP,
 * and closed at the end.
 *
 *   npm test
 */

import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { CASES, QUIZ, BIOMOLECULES } from '../../shared/index.js';

let server;
let base;

before(async () => {
  const app = createApp({ serveClient: false });
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server?.close());

const get = async (p) => {
  const res = await fetch(base + p);
  return { status: res.status, body: await res.json() };
};
const post = async (p, body) => {
  const res = await fetch(base + p, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { status: res.status, body: await res.json() };
};

/* ---------------------------------------------------------------- health */

test('health endpoint reports ok', async () => {
  const { status, body } = await get('/api/health');
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
});

test('meta endpoint carries the score rules', async () => {
  const { body } = await get('/api/meta');
  assert.equal(body.scoreRules.correctBiomolecule, 50);
  assert.equal(body.scoreRules.correctMechanism, 50);
  assert.equal(body.scoreRules.hintPenalty, -10);
});

/* ----------------------------------------------------------------- cases */

test('case list returns every case as a summary', async () => {
  const { body } = await get('/api/cases');
  assert.equal(body.cases.length, CASES.length);
  assert.ok(body.cases.every((c) => c.title && c.number && c.channel));
});

test('a single case is served WITHOUT its answer key', async () => {
  const { body } = await get('/api/cases/case-01');
  assert.equal(body.case.id, 'case-01');
  assert.equal(body.case.solution, undefined, 'solution must never leave the server');
  assert.equal(body.case.evidence.length, 4);
  assert.ok(body.case.questions.biomolecule.options.length >= 2);
});

test('no case payload leaks a solution, for any case', async () => {
  for (const c of CASES) {
    const { body } = await get(`/api/cases/${c.id}`);
    assert.equal(body.case.solution, undefined, `${c.id} leaked its solution`);
    assert.ok(!JSON.stringify(body).includes('wrongMechanism'), `${c.id} leaked feedback keys`);
  }
});

test('unknown case id returns a JSON 404', async () => {
  const { status, body } = await get('/api/cases/case-99');
  assert.equal(status, 404);
  assert.equal(body.error.code, 'not_found');
});

/* ---------------------------------------------------------------- solving */

test('a correct submission is graded as solved and scores 120 clean', async () => {
  const { status, body } = await post('/api/cases/case-01/solve', {
    biomolecule: 'protein',
    mechanism: 'enzyme-inhibition',
    attempt: 1,
    hintsUsed: 0
  });
  assert.equal(status, 200);
  assert.equal(body.result.solved, true);
  assert.equal(body.result.points, 120); // 50 + 50 + 20 first-attempt bonus
  assert.ok(body.result.explanation.length > 200);
  assert.ok(Array.isArray(body.result.pathway));
});

test('a half-right submission scores the right half and explains the wrong half', async () => {
  const { body } = await post('/api/cases/case-01/solve', {
    biomolecule: 'protein',
    mechanism: 'substrate-depletion',
    attempt: 1
  });
  assert.equal(body.result.solved, false);
  assert.equal(body.result.biomoleculeCorrect, true);
  assert.equal(body.result.mechanismCorrect, false);
  assert.equal(body.result.points, 50);
  assert.equal(body.result.explanation, null, 'explanation is withheld until solved');
  assert.match(body.result.feedback.mechanism, /240%|rises|depletion/i);
});

test('hints are deducted and never take the score below zero', async () => {
  const { body } = await post('/api/cases/case-02/solve', {
    biomolecule: 'lipid',
    mechanism: 'lipid-peroxidation',
    attempt: 3,
    hintsUsed: 9
  });
  assert.equal(body.result.solved, false);
  assert.equal(body.result.points, 0);
});

test('the first-attempt bonus is not awarded after a hint', async () => {
  const { body } = await post('/api/cases/case-03/solve', {
    biomolecule: 'lipid',
    mechanism: 'lipid-peroxidation',
    attempt: 1,
    hintsUsed: 1
  });
  assert.equal(body.result.solved, true);
  assert.equal(body.result.points, 90); // 50 + 50 - 10, no bonus
});

test('every case has a solution its own options can express', async () => {
  for (const c of CASES) {
    assert.ok(
      c.questions.biomolecule.options.includes(c.solution.biomolecule),
      `${c.id}: correct biomolecule is not among the offered options`
    );
    assert.ok(
      c.questions.mechanism.options.includes(c.solution.mechanism),
      `${c.id}: correct mechanism is not among the offered options`
    );
    const { body } = await post(`/api/cases/${c.id}/solve`, {
      biomolecule: c.solution.biomolecule,
      mechanism: c.solution.mechanism,
      attempt: 1
    });
    assert.equal(body.result.solved, true, `${c.id} could not be solved with its own answer key`);
  }
});

test('every wrong option has feedback written for it', async () => {
  for (const c of CASES) {
    for (const opt of c.questions.biomolecule.options) {
      if (opt === c.solution.biomolecule) continue;
      assert.ok(c.solution.wrongBiomolecule?.[opt], `${c.id}: no feedback for biomolecule "${opt}"`);
    }
    for (const opt of c.questions.mechanism.options) {
      if (opt === c.solution.mechanism) continue;
      assert.ok(c.solution.wrongMechanism?.[opt], `${c.id}: no feedback for mechanism "${opt}"`);
    }
  }
});

test('an unknown biomolecule id is rejected with 400, not scored', async () => {
  const { status, body } = await post('/api/cases/case-01/solve', {
    biomolecule: 'ribosome',
    mechanism: 'enzyme-inhibition'
  });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'bad_request');
  assert.ok(body.error.details.allowed.includes('protein'));
});

test('a mechanism that was not offered for this case is rejected', async () => {
  const { status } = await post('/api/cases/case-01/solve', {
    biomolecule: 'protein',
    mechanism: 'nucleic-acid-intercalation'
  });
  assert.equal(status, 400);
});

/* ------------------------------------------------------------------ hints */

test('a hint is served one field at a time', async () => {
  const { body } = await post('/api/cases/case-01/hint', { field: 'mechanism' });
  assert.equal(body.cost, 10);
  assert.ok(body.hint.length > 40);
  const bad = await post('/api/cases/case-01/hint', { field: 'colour' });
  assert.equal(bad.status, 400);
});

/* ------------------------------------------------------------------- quiz */

test('quiz questions are served without their answers', async () => {
  const { body } = await get('/api/quiz');
  assert.equal(body.questions.length, 10);
  assert.ok(body.questions.every((q) => q.answer === undefined && q.explanation === undefined));
});

test('quiz grading returns a score and an explanation per question', async () => {
  const allCorrect = Object.fromEntries(QUIZ.map((q) => [q.id, q.answer]));
  const { body } = await post('/api/quiz/submit', { answers: allCorrect });
  assert.equal(body.result.score, 10);
  assert.equal(body.result.points, 100);
  assert.ok(body.result.results.every((r) => r.explanation));
});

test('a partly-correct quiz is scored correctly and marks the misses', async () => {
  const answers = Object.fromEntries(QUIZ.map((q, i) => [q.id, i < 3 ? (q.answer + 1) % 4 : q.answer]));
  const { body } = await post('/api/quiz/submit', { answers });
  assert.equal(body.result.score, 7);
  assert.equal(body.result.results.filter((r) => !r.correct).length, 3);
});

test('an unknown question id is rejected', async () => {
  const { status } = await post('/api/quiz/submit', { answers: { q99: 0 } });
  assert.equal(status, 400);
});

/* --------------------------------------------------------------- progress */

test('session progress accumulates across calls and is capped per case', async () => {
  const sessionId = 'test-session-' + Math.random().toString(36).slice(2);
  await post('/api/cases/case-01/solve', {
    biomolecule: 'protein', mechanism: 'enzyme-inhibition', attempt: 1, sessionId
  });
  await post('/api/cases/case-02/solve', {
    biomolecule: 'dna-rna', mechanism: 'oxidative-damage', attempt: 1, sessionId
  });
  // Re-solving case 01 must not bank its points a second time.
  await post('/api/cases/case-01/solve', {
    biomolecule: 'protein', mechanism: 'enzyme-inhibition', attempt: 1, sessionId
  });

  const { body } = await get(`/api/progress/${sessionId}`);
  assert.equal(body.session.casesSolved, 2);
  assert.equal(body.session.score, 240);
  assert.equal(body.session.casesTotal, CASES.length);

  const reset = await post(`/api/progress/${sessionId}/reset`, {});
  assert.equal(reset.body.session.score, 0);
  assert.equal(reset.body.session.casesSolved, 0);
});

test('retaking the quiz replaces the old quiz score instead of stacking', async () => {
  const sessionId = 'quiz-session-' + Math.random().toString(36).slice(2);
  const all = Object.fromEntries(QUIZ.map((q) => [q.id, q.answer]));
  await post('/api/quiz/submit', { answers: all, sessionId });
  await post('/api/quiz/submit', { answers: all, sessionId });
  const { body } = await get(`/api/progress/${sessionId}`);
  assert.equal(body.session.score, 100);
});

/* ------------------------------------------------------- content + errors */

test('the biomolecule database is complete and internally linked', async () => {
  const { body } = await get('/api/biomolecules');
  assert.equal(body.biomolecules.length, 4);
  for (const b of body.biomolecules) {
    assert.ok(b.howToxicityHits.length >= 3, `${b.id} needs at least three mechanisms`);
    assert.ok(b.markers.length >= 3, `${b.id} needs its laboratory markers`);
    assert.ok(b.structure.length >= 3);
  }
  assert.deepEqual(
    body.biomolecules.map((b) => b.id).sort(),
    BIOMOLECULES.map((b) => b.id).sort()
  );
});

test('the toxin library has four categories, each with real entries', async () => {
  const { body } = await get('/api/toxins');
  assert.equal(body.categories.length, 4);
  for (const cat of body.categories) {
    assert.ok(cat.entries.length >= 4);
    for (const e of cat.entries) {
      assert.ok(e.target && e.mechanism && e.consequence, `${e.name} is missing a field`);
    }
  }
});

test('the mechanism map has five ordered stages', async () => {
  const { body } = await get('/api/mechanism-map');
  assert.equal(body.mechanismMap.stages.length, 5);
  assert.deepEqual(body.mechanismMap.stages.map((s) => s.index), [1, 2, 3, 4, 5]);
});

test('every cell-map route names parts that exist', async () => {
  const { body } = await get('/api/cell-map');
  const ids = new Set(body.cellMap.parts.map((p) => p.id));
  for (const [mech, route] of Object.entries(body.cellMap.routes)) {
    for (const step of route.path) {
      assert.ok(ids.has(step), `route ${mech} references unknown part "${step}"`);
    }
  }
});

test('an unknown API path returns JSON, not the SPA fallback', async () => {
  const res = await fetch(base + '/api/nope');
  assert.equal(res.status, 404);
  assert.match(res.headers.get('content-type'), /application\/json/);
});

test('malformed JSON is reported as bad_json rather than crashing', async () => {
  const res = await fetch(base + '/api/cases/case-01/solve', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{ not json'
  });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, 'bad_json');
});
