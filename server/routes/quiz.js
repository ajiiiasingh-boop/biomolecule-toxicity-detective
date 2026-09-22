/**
 * quiz.js — the ten-question quiz.
 *
 * GET sends the questions with the answer index removed. POST grades a whole
 * submission at once and sends back, per question, what was chosen, what was
 * correct, and the explanation — which is the only moment the explanations
 * cross the wire.
 */

import { Router } from 'express';
import { QUIZ, publicQuestion, gradeQuiz } from '../../shared/index.js';
import { route, badRequest } from '../lib/http.js';
import { recordQuiz } from '../lib/store.js';
import { summarise } from './cases.js';

const router = Router();

router.get('/', route((req, res) => {
  res.json({
    questions: QUIZ.map(publicQuestion),
    total: QUIZ.length,
    pointsPerCorrect: 10
  });
}));

router.post('/submit', route((req, res) => {
  const answers = req.body?.answers;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    throw badRequest('"answers" must be an object mapping question id to the chosen option index.', {
      example: { q1: 1, q2: 0 }
    });
  }

  const known = new Set(QUIZ.map((q) => q.id));
  const unknown = Object.keys(answers).filter((k) => !known.has(k));
  if (unknown.length) {
    throw badRequest('Unknown question id in submission.', { unknown, allowed: [...known] });
  }

  const result = gradeQuiz(QUIZ, answers);
  const session = req.body?.sessionId ? recordQuiz(req.body.sessionId, result) : null;

  res.json({ result, session: session ? summarise(session) : null });
}));

export default router;
