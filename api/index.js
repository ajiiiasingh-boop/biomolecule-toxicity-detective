/**
 * api/index.js — the Vercel entry point for the Express API.
 *
 * Vercel does not run a long-lived Node process; it runs functions. A file in
 * this /api folder becomes one. An Express app is itself a (req, res) function,
 * so the whole existing API can be handed over unchanged — the same app.js the
 * local server uses, with the same routes, the same answer-key stripping and
 * the same grading.
 *
 * `serveClient: false` because on Vercel the built site is served by the CDN
 * from client/dist, not by Express.
 *
 * Routing: vercel.json rewrites /api/* to this function, and Vercel preserves
 * the original request path, so Express still sees /api/cases and matches its
 * own routes. The guard below normalises the path anyway, so the function also
 * works if it is ever mounted somewhere that strips the prefix.
 *
 * One consequence worth knowing: each invocation may get a fresh instance, so
 * the in-memory session store is not shared between requests the way it is when
 * you run the server locally. Scores still work — the browser keeps its own
 * copy — but /api/progress is per-instance here. Local runs behave exactly as
 * documented in the README.
 */

import { createApp } from '../server/app.js';

const app = createApp({ serveClient: false });

export default function handler(req, res) {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url === '/' ? '' : req.url);
  }
  return app(req, res);
}
