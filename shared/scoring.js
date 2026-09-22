/**
 * scoring.js — the single definition of how an investigation is scored.
 *
 * It lives in shared/ because both sides need it: the server awards points
 * when it grades a submission, and the client shows the rules on screen and
 * can score offline when no API is reachable. One definition, no drift.
 */

export const SCORE_RULES = {
  correctBiomolecule: 50,
  correctMechanism: 50,
  hintPenalty: -10,
  firstAttemptBonus: 20,
  quizCorrect: 10
};

export const RULE_TEXT = [
  { label: 'Correct biomolecule', value: '+50' },
  { label: 'Correct mechanism', value: '+50' },
  { label: 'Solved on the first attempt', value: '+20' },
  { label: 'Each hint used', value: '−10' },
  { label: 'Each correct quiz answer', value: '+10' }
];

/**
 * Grade one case submission.
 *
 * @param {object} theCase   the full case, answer key included
 * @param {object} answer    { biomolecule, mechanism }
 * @param {object} context   { hintsUsed = 0, attempt = 1 }
 */
export function gradeCase(theCase, answer, context = {}) {
  const hintsUsed = Number(context.hintsUsed) || 0;
  const attempt = Number(context.attempt) || 1;

  const biomoleculeCorrect = answer.biomolecule === theCase.solution.biomolecule;
  const mechanismCorrect = answer.mechanism === theCase.solution.mechanism;
  const solved = biomoleculeCorrect && mechanismCorrect;

  let points = 0;
  if (biomoleculeCorrect) points += SCORE_RULES.correctBiomolecule;
  if (mechanismCorrect) points += SCORE_RULES.correctMechanism;
  if (solved && attempt === 1 && hintsUsed === 0) points += SCORE_RULES.firstAttemptBonus;
  points += hintsUsed * SCORE_RULES.hintPenalty;
  if (points < 0) points = 0;

  const breakdown = [
    {
      label: 'Biomolecule identified',
      correct: biomoleculeCorrect,
      points: biomoleculeCorrect ? SCORE_RULES.correctBiomolecule : 0
    },
    {
      label: 'Mechanism identified',
      correct: mechanismCorrect,
      points: mechanismCorrect ? SCORE_RULES.correctMechanism : 0
    }
  ];
  if (solved && attempt === 1 && hintsUsed === 0) {
    breakdown.push({ label: 'First-attempt bonus', correct: true, points: SCORE_RULES.firstAttemptBonus });
  }
  if (hintsUsed > 0) {
    breakdown.push({
      label: `Hints used (${hintsUsed})`,
      correct: false,
      points: hintsUsed * SCORE_RULES.hintPenalty
    });
  }

  return {
    caseId: theCase.id,
    solved,
    biomoleculeCorrect,
    mechanismCorrect,
    points,
    breakdown,
    submitted: { biomolecule: answer.biomolecule, mechanism: answer.mechanism },
    correct: {
      biomolecule: theCase.solution.biomolecule,
      mechanism: theCase.solution.mechanism
    },
    // Feedback is tailored: the right answer's reasoning when solved, a
    // pointed nudge toward the overlooked evidence when not.
    verdict: theCase.solution.verdict,
    explanation: solved ? theCase.solution.explanation : null,
    pathway: solved ? theCase.solution.pathway : null,
    keyTerms: solved ? theCase.solution.keyTerms : null,
    feedback: solved
      ? null
      : {
          biomolecule: biomoleculeCorrect
            ? 'Correct — this part of your conclusion stands.'
            : theCase.solution.wrongBiomolecule?.[answer.biomolecule] ||
              'That class does not fit the evidence. Re-read the Biomolecule Clue card.',
          mechanism: mechanismCorrect
            ? 'Correct — this part of your conclusion stands.'
            : theCase.solution.wrongMechanism?.[answer.mechanism] ||
              'That mechanism does not fit the evidence. Re-read the Experimental Data card.'
        }
  };
}

/** Grade a whole quiz submission. `answers` maps question id -> chosen index. */
export function gradeQuiz(questions, answers = {}) {
  const results = questions.map((q) => {
    const chosen = answers[q.id];
    const correct = chosen === q.answer;
    return {
      id: q.id,
      topic: q.topic,
      question: q.question,
      options: q.options,
      chosen: typeof chosen === 'number' ? chosen : null,
      answer: q.answer,
      correct,
      explanation: q.explanation
    };
  });
  const score = results.filter((r) => r.correct).length;
  return {
    score,
    total: questions.length,
    points: score * SCORE_RULES.quizCorrect,
    percentage: Math.round((score / questions.length) * 100),
    results
  };
}
