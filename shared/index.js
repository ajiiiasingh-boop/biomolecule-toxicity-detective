/**
 * shared/index.js — one import surface for the data layer.
 *
 * Both the Express server and the React client import from here. The server
 * uses it to answer API requests and to grade submissions; the client bundles
 * it as an offline fallback so the site still works with no backend running
 * (see client/src/lib/api.js).
 *
 * Honest note for anyone reading this as a code review: because the client
 * bundles this module, the answer keys are present in the browser bundle in
 * offline mode. The server-backed path does hide them — `publicCase()` strips
 * `solution` before anything leaves the API. Keeping both was a deliberate
 * trade so the project runs as a static site for a demo and as a real
 * client/server app for the code walkthrough.
 */

export { BIOMOLECULES, MECHANISMS, biomoleculeById, mechanismById, BIOMOLECULE_IDS, MECHANISM_IDS } from './taxonomy.js';
export { CASES, caseById, publicCase, caseSummary } from './cases.js';
export { TOXIN_CATEGORIES, toxinCategoryById } from './toxins.js';
export { MECHANISM_MAP, CELL_MAP } from './mechanismMap.js';
export { QUIZ, publicQuestion } from './quiz.js';
export { SCORE_RULES, RULE_TEXT, gradeCase, gradeQuiz } from './scoring.js';

export const PROJECT = {
  name: 'Biomolecule Toxicity Detective',
  version: '1.0.0',
  disclaimer:
    'This website is an educational simulation created to demonstrate how toxic stress can affect biomolecules and cellular processes. The cases, numerical values and investigation outcomes are simplified models intended for learning and should not be interpreted as clinical, diagnostic or real-world toxicology assessments.'
};
