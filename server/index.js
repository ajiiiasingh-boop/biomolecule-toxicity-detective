/**
 * index.js — starts the HTTP server.
 *
 *   npm run dev     server on :4000, Vite dev server on :5173 proxying /api here
 *   npm run build   builds the client into client/dist
 *   npm start       this server on :4000, serving the API *and* the built client
 */

import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 4000;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log('');
  console.log('  BIOMOLECULE TOXICITY DETECTIVE — API');
  console.log(`  listening on http://localhost:${PORT}`);
  console.log('');
  console.log('  GET  /api/health');
  console.log('  GET  /api/meta');
  console.log('  GET  /api/cases                 list of case summaries');
  console.log('  GET  /api/cases/:id             one case, answer key removed');
  console.log('  POST /api/cases/:id/hint        { field } -> one hint, costs 10');
  console.log('  POST /api/cases/:id/solve       { biomolecule, mechanism } -> graded');
  console.log('  GET  /api/biomolecules          biomolecule database');
  console.log('  GET  /api/mechanisms            mechanism catalogue');
  console.log('  GET  /api/mechanism-map         five-stage exposure -> effect chain');
  console.log('  GET  /api/cell-map              interactive cell diagram data');
  console.log('  GET  /api/toxins                toxin library');
  console.log('  GET  /api/quiz                  10 questions, answers removed');
  console.log('  POST /api/quiz/submit           { answers } -> graded + explanations');
  console.log('  GET  /api/progress/:sessionId   session score and case history');
  console.log('');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`\n${signal} received, shutting down.`);
    server.close(() => process.exit(0));
  });
}
