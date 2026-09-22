# Biomolecule Toxicity Detective

An interactive educational simulation. You play a toxicity detective: each case
hands you evidence from a cell that has been exposed to something, and you have
to work out **which biomolecule was damaged** and **by what mechanism**.

> **Educational simulation.** This project demonstrates how toxic stress can
> affect biomolecules and cellular processes. The cases, numerical values and
> investigation outcomes are simplified models intended for learning, and should
> not be interpreted as clinical, diagnostic or real-world toxicology
> assessments. Every dataset is invented and is labelled as simulated wherever
> it appears on screen.

---

## Run it

Requires **Node 20 or newer** (<https://nodejs.org>, the LTS button). Nothing
else — no database, no global installs.

**The easy way:** double-click **`START-WINDOWS.bat`** on Windows, or
**`START-MAC-LINUX.command`** on macOS and Linux. It checks for Node, installs
dependencies the first time, builds the site, starts the server and opens your
browser. Close the window to stop.

**The terminal way:**

```bash
npm install     # installs both workspaces (server + client)
npm run preview # builds, then serves API + site together on :4000
```

Open <http://localhost:4000>. The status strip at the top of the page should
read **“Live API connected”** with a green dot — that is the frontend confirming
it reached the backend.

While editing code, use `npm run dev` instead: API on `:4000`, Vite dev server
with hot reload on <http://localhost:5173>.

### Put it on the web

See **[DEPLOY.md](DEPLOY.md)**. Four routes, all free: a single self-contained
`.html` file that needs no server at all, a drag-and-drop to Netlify, GitHub
Pages (config included, rebuilds on every push), or Render — which runs the
Express API live so the backend is part of the demo. Configuration files for all
of them are already in this repository.

### Other commands

| Command | What it does |
|---|---|
| `npm run dev` | API (`:4000`) and Vite dev server (`:5173`) together, with hot reload. The dev server proxies `/api` to the API, so the browser sees one origin. |
| `npm run build` | Builds the client into `client/dist/`. |
| `npm start` | Runs the API on `:4000` **and** serves the built client from the same port. One process, one URL. |
| `npm run preview` | `build` then `start`. |
| `npm test` | Runs the API test suite (27 tests, Node's built-in test runner). |
| `npm run standalone` | Builds a single self-contained `.html` file into `client/dist-standalone/` that runs with no server at all. |

---

## How it is put together

```
biomolecule-toxicity-detective/
├── shared/                  ← imported by BOTH server and client
│   ├── taxonomy.js            the 4 biomolecules + 8 mechanisms; ids, colours, reference text
│   ├── cases.js               the 6 case files: evidence, datasets, questions, answer keys
│   ├── toxins.js              the toxin library: 4 categories, 17 entries
│   ├── mechanismMap.js        the 5-stage exposure→effect chain, and the cell map
│   ├── quiz.js                10 questions with answers and explanations
│   ├── scoring.js             the scoring rules and the two grading functions
│   └── index.js               one import surface
│
├── server/                  ← Express REST API
│   ├── index.js               starts the HTTP server, prints the route list
│   ├── app.js                 builds the app (separated so tests can run it portless)
│   ├── routes/                content.js · cases.js · quiz.js · progress.js
│   ├── lib/                   store.js (in-memory sessions) · http.js (errors, validation)
│   └── test/api.test.js       27 tests over real HTTP
│
└── client/                  ← React single-page app (Vite)
    ├── vite.config.js         @shared alias, /api dev proxy, standalone build mode
    └── src/
        ├── App.jsx            HashRouter + routes
        ├── lib/api.js         every API call, each with a local fallback
        ├── lib/session.jsx    score / progress context, mirrored to localStorage
        ├── charts/DoseChart.jsx   hand-built SVG dose–response charts
        ├── components/        Chrome, Field, CellDiagram, Glyphs, Pathway, Bits
        ├── pages/             Home, CaseFiles, Investigation, Biomolecules,
        │                      CellLab, MechanismMap, ToxinLibrary, Quiz,
        │                      Debrief, About, NotFound
        └── styles/            tokens.css (the design system) + app.css
```

### The one idea worth explaining in a viva

**`shared/` is imported by both sides.** The server imports it to answer requests
and to grade submissions; the client imports it through the `@shared` Vite alias.
So the cases, the list of biomolecules and mechanisms, and the scoring rules have
exactly **one definition** and cannot drift apart. Add a case to `shared/cases.js`
and it appears in the API, in the case index, in the investigation screen and in
the debrief, with no other edit anywhere.

### Why there is a backend at all

Because the game needs someone to hold the answers:

* `GET /api/cases/:id` runs the case through `publicCase()`, which strips the
  `solution` object. The evidence and the questions go to the browser; the answer
  key does not. A test asserts this for every case.
* `POST /api/cases/:id/solve` grades server-side and returns only what was
  earned — the full explanation and causal pathway when the case is solved,
  targeted feedback pointing at the overlooked evidence when it is not.
* Hints are metered by the server (`POST /api/cases/:id/hint`), one field at a
  time, because each one costs 10 points.
* The quiz is marked server-side; explanations cross the wire only after
  submission.
* Session progress is kept server-side against a browser-generated session id.

### The offline fallback, and an honest caveat

On startup the client probes `/api/health` once. If it answers, everything goes
through the API. If it does not — the standalone build, a static host, or the API
simply not running — the client falls back to computing the same answers locally
from the bundled `shared/` data. Every call in `client/src/lib/api.js` is declared
as a pair of implementations for exactly this reason.

The caveat, stated plainly because a reviewer will spot it: **in offline mode the
answer keys are present in the browser bundle**, since the client bundles all of
`shared/`. The server-backed path genuinely hides them. Both paths were kept on
purpose, so the project runs as a static page for a demo and as a real
client/server application for a code walkthrough. Splitting `shared/` into a
content module and a server-only answer module would close the gap at the cost of
the offline mode.

---

## API reference

Base URL `http://localhost:4000`. Everything is JSON. No authentication.

### Content

| Method | Path | Returns |
|---|---|---|
| `GET` | `/api/health` | `{ status, service, version, uptime }` |
| `GET` | `/api/meta` | project info, scoring rules, content counts |
| `GET` | `/api/biomolecules` | all four database entries |
| `GET` | `/api/biomolecules/:id` | one entry (`dna-rna`, `protein`, `lipid`, `carbohydrate`) |
| `GET` | `/api/mechanisms` | the mechanism catalogue |
| `GET` | `/api/mechanism-map` | the five-stage exposure→effect chain |
| `GET` | `/api/cell-map` | cell compartments and the per-mechanism routes |
| `GET` | `/api/toxins` | all four toxin categories |
| `GET` | `/api/toxins/:id` | one category |

### Investigation

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/api/cases` | — | case summaries for the index |
| `GET` | `/api/cases/:id` | — | one case, **`solution` removed** |
| `POST` | `/api/cases/:id/hint` | `{ field, sessionId? }` | one hint (`field` is `biomolecule` or `mechanism`), cost 10 |
| `POST` | `/api/cases/:id/solve` | `{ biomolecule, mechanism, hintsUsed?, attempt?, sessionId? }` | graded result |

Example:

```bash
curl -s localhost:4000/api/cases/case-01/solve \
  -H 'content-type: application/json' \
  -d '{"biomolecule":"protein","mechanism":"enzyme-inhibition","attempt":1}'
```

```jsonc
{
  "result": {
    "solved": true,
    "points": 120,                  // 50 + 50 + 20 first-attempt bonus
    "breakdown": [ /* per-line scoring */ ],
    "correct":  { "biomolecule": "protein", "mechanism": "enzyme-inhibition" },
    "explanation": "Evidence C describes a protein and nothing else…",
    "pathway": ["Toxicant enters the cell", "…"],
    "keyTerms": [ { "term": "Vmax", "def": "…" } ],
    "feedback": null                // populated instead when the answer is wrong
  },
  "session": null                   // present when a sessionId was sent
}
```

### Quiz and progress

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/api/quiz` | — | 10 questions, **answers removed** |
| `POST` | `/api/quiz/submit` | `{ answers: { q1: 2, … }, sessionId? }` | score plus a per-question explanation |
| `GET` | `/api/progress/:sessionId` | — | score, cases solved, attempts, hints, quiz |
| `POST` | `/api/progress/:sessionId/reset` | — | clears that session |

### Errors

Every failure comes back in the same shape, and an unknown `/api/...` path
returns JSON rather than falling through to the SPA:

```json
{ "error": { "code": "bad_request", "message": "…", "details": { "allowed": ["…"] } } }
```

`400 bad_request` (unknown id, mechanism not offered for that case),
`400 bad_json`, `404 not_found`, `500 internal_error`.

---

## Scoring

| Event | Points |
|---|---|
| Correct biomolecule | +50 |
| Correct mechanism | +50 |
| Solved on the first attempt with no hints | +20 |
| Each hint used | −10 |
| Each correct quiz answer | +10 |

Points bank **once per case**, so replaying a solved case cannot farm score, and
retaking the quiz replaces its previous contribution rather than stacking. A
single case can never score below zero. There is no leaderboard — the debrief
reports your own record only.

---

## The cases

| # | Title | Biomolecule | Mechanism |
|---|---|---|---|
| 01 | The Silent Enzyme | Protein | Enzyme inhibition (Vmax ↓, Km unchanged) |
| 02 | The Oxidative Trail | DNA | Oxidative damage (Fenton chemistry → 8-oxo-dG, strand breaks) |
| 03 | The Broken Barrier | Lipid | Lipid peroxidation (self-propagating chain, MDA/4-HNE) |
| 04 | The Misfolded Protein | Protein | Denaturation (Tm collapse, aggregation) |
| 05 | The Metabolic Disruption | Carbohydrate | Metabolic interference (aerobic → anaerobic shift) |
| 06 | The Garbled Message | RNA | Intercalation and transcription block |

Cases 01 and 04 are deliberately a matched pair: both show activity falling while
protein abundance stays constant, and the measurement that separates them is
melting temperature. Case 05 is the one that rewards care — its molecular target
is a mitochondrial protein, while the biomolecule class whose *handling* is
disrupted is carbohydrate, and the explanation says so explicitly rather than
hiding the nuance.

---

## Design notes

**One dark theme, committed.** The interface is a laboratory analyser at night.
All colours are painted explicitly in `client/src/styles/tokens.css`; nothing is
inherited from the host page.

**Colour means something.** The chrome is nearly achromatic — cool steel greys —
and the only saturated colour on screen belongs to the four biomolecule channels.
Those four values were checked with a colour-vision-deficiency validator against
the panel surface `#101728`: all four clear the lightness band, the chroma floor,
the normal-vision separation floor and 3:1 contrast. The tightest CVD pair sits in
the warn band, which is only acceptable alongside secondary encoding — so every
channel colour in the app is always shipped with an icon **and** a written label,
and never carries identity on its own.

**Charts.** Hand-built SVG, not a library. One y-scale per chart, always: where a
case measures things in different units (Case 04 has °C and % of control) it uses
two charts rather than a dual axis, because a dual axis lets the author choose
where the two lines appear to cross. Every chart has a legend and end-of-line
direct labels when it has more than one series, a hover crosshair and tooltip,
and a table view of the same numbers one click away.

**Illustrations.** The cell diagram, the biomolecule glyphs and the pathway
diagram are inline SVG. Four of the glyphs are structural pictures of the
molecules themselves — a double helix, a folded chain, a bilayer, a pyranose
ring — and no icon library has anything that means those things.

**Motion is rationed.** A drifting particle field behind the page, a scan sweep
when an evidence card opens, and a pathway that reveals step by step because that
is the order the biology happens in. All of it stops under
`prefers-reduced-motion`, and the particle field also pauses when the tab is
hidden.

**Accessibility.** Keyboard-operable evidence cards, cell hotspots and chart
points; a skip link; visible focus states; `aria-pressed` on every toggle;
`aria-live` on the evidence viewer and the verdict; table views for every chart;
no horizontal page scroll at 390 px.

---

## Scope of the toxin library

Entries describe only what a class of substance does to a biomolecule once it is
already inside a cell — target, mechanism, cellular consequence, and the
laboratory markers used to detect it. Nothing in this project describes how any
substance is obtained, prepared, concentrated, handled or administered, and
nothing here is exposure guidance.

---

## Tests

```bash
npm test
```

27 tests over real HTTP against the Express app on an ephemeral port. Beyond the
routine status-code checks, they assert the things that would quietly ruin the
game if they broke:

* no case payload leaks `solution` or its feedback keys, for any case;
* every case can be solved with its own answer key, and every correct answer is
  actually among the offered options;
* every wrong option in every case has feedback written for it;
* scoring arithmetic — the first-attempt bonus, the hint penalty, the floor at
  zero, points banking once per case, the quiz replacing rather than stacking;
* an unknown `/api/...` path returns JSON rather than the SPA's HTML.
