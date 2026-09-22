/**
 * cases.js — the investigation endpoints.
 *
 * This is where the server earns its place in the project. Cases go out with
 * `solution` stripped, so the evidence and the questions are public but the
 * answer key never leaves the process. Grading happens here, against the
 * shared scoring rules, and the response carries back only what the player
 * has earned: the full explanation when they solved it, targeted feedback on
 * exactly what they got wrong when they did not.
 */

import { Router } from 'express';
import {
  CASES,
  caseById,
  publicCase,
  caseSummary,
  gradeCase,
  BIOMOLECULE_IDS,
  MECHANISM_IDS
} from '../../shared/index.js';
import { route, notFound, badRequest, mustBeOneOf } from '../lib/http.js';
import { recordHint, recordSolve, getSession } from '../lib/store.js';

const router = Router();

router.get('/', route((req, res) => {
  res.json({ cases: CASES.map(caseSummary) });
}));

router.get('/:id', route((req, res) => {
  const found = caseById(req.params.id);
  if (!found) throw notFound('case', req.params.id);
  res.json({ case: publicCase(found) });
}));

/**
 * POST /api/cases/:id/hint
 * Body: { field: "biomolecule" | "mechanism", sessionId? }
 * Hints are served one at a time and cost score, so they are metered here
 * rather than shipped inside the case payload.
 */
router.post('/:id/hint', route((req, res) => {
  const found = caseById(req.params.id);
  if (!found) throw notFound('case', req.params.id);

  const field = req.body?.field;
  mustBeOneOf(field, ['biomolecule', 'mechanism'], 'field');

  const session = req.body?.sessionId ? recordHint(req.body.sessionId, found.id) : null;

  res.json({
    caseId: found.id,
    field,
    hint: found.solution.hints[field],
    cost: 10,
    session: session ? summarise(session) : null
  });
}));

/**
 * POST /api/cases/:id/solve
 * Body: { biomolecule, mechanism, hintsUsed?, attempt?, sessionId? }
 */
router.post('/:id/solve', route((req, res) => {
  const found = caseById(req.params.id);
  if (!found) throw notFound('case', req.params.id);

  const body = req.body || {};
  if (typeof body !== 'object') throw badRequest('Request body must be a JSON object.');

  mustBeOneOf(body.biomolecule, BIOMOLECULE_IDS, 'biomolecule');
  mustBeOneOf(body.mechanism, MECHANISM_IDS, 'mechanism');

  // A mechanism that was never offered for this case is a client bug.
  if (!found.questions.mechanism.options.includes(body.mechanism)) {
    throw badRequest('That mechanism was not offered for this case.', {
      field: 'mechanism',
      received: body.mechanism,
      allowed: found.questions.mechanism.options
    });
  }

  const result = gradeCase(found, body, {
    hintsUsed: body.hintsUsed,
    attempt: body.attempt
  });

  const session = body.sessionId ? recordSolve(body.sessionId, found.id, result) : null;

  res.json({ result, session: session ? summarise(session) : null });
}));

function summarise(session) {
  const solved = Object.values(session.cases).filter((c) => c.solved).length;
  return {
    id: session.id,
    score: session.score,
    casesSolved: solved,
    casesTotal: CASES.length,
    attempts: session.attempts,
    hintsUsed: session.hintsUsed,
    cases: session.cases,
    quiz: session.quiz
  };
}

export { summarise };
export default router;
