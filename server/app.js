/**
 * app.js — builds the Express application.
 *
 * Kept separate from index.js so the test suite can import the app and drive
 * it without binding a port or starting a long-lived process.
 */

import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import contentRoutes from './routes/content.js';
import caseRoutes from './routes/cases.js';
import quizRoutes from './routes/quiz.js';
import progressRoutes from './routes/progress.js';
import { ApiError } from './lib/http.js';
import { PROJECT } from '../shared/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(here, '../client/dist');

export function createApp({ serveClient = true } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '64kb' }));

  // One-line request log. Enough to demonstrate the API is being hit during a
  // walkthrough, quiet enough not to drown the console.
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      const started = Date.now();
      res.on('finish', () => {
        console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - started}ms)`);
      });
    }
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: PROJECT.name, version: PROJECT.version, uptime: process.uptime() });
  });

  app.use('/api', contentRoutes);
  app.use('/api/cases', caseRoutes);
  app.use('/api/quiz', quizRoutes);
  app.use('/api/progress', progressRoutes);

  // Unknown API path -> JSON 404 (never the SPA fallback, which would send
  // HTML to something expecting JSON and produce a confusing parse error).
  app.use('/api', (req, res) => {
    res.status(404).json({
      error: { code: 'not_found', message: `No API route for ${req.method} ${req.originalUrl}.` }
    });
  });

  // In production the same process serves the built client, so the whole app
  // is one origin on one port and no proxy is needed.
  if (serveClient && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    // SPA fallback. Written as middleware rather than app.get('*') because
    // Express 5 routes patterns through path-to-regexp v8, which rejects a
    // bare '*'.
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  } else if (serveClient) {
    app.get('/', (req, res) => {
      res
        .status(200)
        .type('text/plain')
        .send(
          `${PROJECT.name} API is running.\n\n` +
            'The built client was not found. Run "npm run build" to build it, or use\n' +
            '"npm run dev" and open the Vite dev server instead.\n\n' +
            'Try: /api/health, /api/cases, /api/biomolecules, /api/quiz\n'
        );
    });
  }

  // Central error handler. Everything thrown in a route lands here.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
      return res.status(err.status).json({
        error: { code: err.code, message: err.message, details: err.details }
      });
    }
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: { code: 'bad_json', message: 'Request body was not valid JSON.' }
      });
    }
    console.error('Unhandled error:', err);
    return res.status(500).json({
      error: { code: 'internal_error', message: 'Something went wrong on the server.' }
    });
  });

  return app;
}

export default createApp;
