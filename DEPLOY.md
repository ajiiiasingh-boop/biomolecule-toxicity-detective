# Putting this on the real web

The site does not depend on Claude, on this machine, or on anything you cannot
get to. It is an ordinary web app, and below are four ways to give it a public
address — in rough order of effort.

Pick **one**. They all produce the same site.

| | Route | Public URL | Backend live? | Effort | Account / card |
|---|---|---|---|---|---|
| A | Single `.html` file | none — a file you can open, email or put on a USB | no | 10 seconds | nothing |
| B | Netlify Drop | `something.netlify.app` | no | 1 minute | free, no card |
| C | GitHub Pages | `you.github.io/repo/` | no | 10 minutes | GitHub, no card |
| **D** | **Vercel** | `your-app.vercel.app` | **yes** | 15 minutes | GitHub + Vercel, **no card** |
| E | Render | `your-app.onrender.com` | yes | 15 minutes | **credit card required** |

**Which should you use for a college submission?** **D — Vercel.** It is the only
route that gives you a public URL with the Express API genuinely running, for
free, with no credit card, and it never sleeps. The API runs as a serverless
function via `api/index.js`, which hands Vercel the same Express app the local
server uses — same routes, same answer-key stripping, same grading.

Route E (Render) does the same thing with a normal always-on Node process and
needs no code adapter, but Render's free tier now asks for a credit card and
sleeps after 15 minutes idle, so it is the second choice.

Every route works because the client detects whether an API is reachable and
falls back to its bundled data layer if not. No route needs code changes.

---

## A — One file, no internet, no account

```bash
npm install
npm run standalone
```

That writes **`client/dist-standalone/index.html`** — one file, about 385 KB,
with the CSS, the JavaScript and all six cases inlined.

Double-click it. It opens in any browser and the whole site works: every case,
chart, the quiz, the cell lab, scoring, all of it. You can email it, put it on a
pen drive, or hand it in as a file. Nothing to install on the other machine.

This is the safest thing to carry to a presentation, because it cannot be
defeated by the room's wifi.

---

## B — Netlify Drop (fastest public URL)

```bash
npm install
npm run build          # produces client/dist/
```

1. Go to **<https://app.netlify.com/drop>**
2. Drag the **`client/dist`** folder onto the page.
3. You get a live URL in about ten seconds.

The link works immediately with no account. To keep it permanently and give it a
nicer name, sign up (free) and click *Claim this site* — then rename it under
*Site settings → Change site name* to something like
`biomolecule-toxicity-detective.netlify.app`.

If you connect the repository to Netlify instead of dragging, the included
`netlify.toml` already sets the build command and publish directory, so there is
nothing to fill in.

---

## C — GitHub Pages (permanent, free, rebuilds itself)

You get `https://<your-username>.github.io/<repository-name>/`, and it updates
every time you push.

**1. Put the project on GitHub.**

```bash
cd biomolecule-toxicity-detective
git init
git add .
git commit -m "Biomolecule Toxicity Detective"
git branch -M main
git remote add origin https://github.com/<your-username>/<repository-name>.git
git push -u origin main
```

(If you prefer clicking: create the repository on github.com first, then use
GitHub Desktop to publish this folder.)

**2. Turn Pages on.** In the repository: **Settings → Pages → Build and
deployment → Source → GitHub Actions**.

**3. That is it.** The workflow at `.github/workflows/deploy-pages.yml` is
already in the project. It installs, runs the 27 tests, builds, and publishes.
Watch it under the **Actions** tab; the URL appears there when it finishes, and
also under Settings → Pages.

The site lives in a subfolder of that URL, which is exactly why the Vite `base`
is set to `'./'` — with the default setting a subfolder deploy loads a blank
page.

---

## D — Vercel (the whole thing, API included, no credit card)

This is the one where `GET /api/cases/case-01` genuinely answers over the
internet, hints are metered server-side, submissions are graded by the server,
and the status strip on the site reads **“Live API connected”**.

**1. Put the project on GitHub — no command line needed.**

Sign up at <https://github.com> if you have not. Then **New repository**, give it
a name, tick **Add a README file**, and **Create repository**.

On the repository page: **Add file → Upload files**. Open the project folder on
your computer, select *everything inside it* (`Ctrl+A` / `Cmd+A`) and drag it
into the browser. Do **not** drag the outer folder itself — GitHub needs
`package.json` at the top level of the repository, not inside a subfolder.

If `node_modules` exists, exclude it; it is large and unnecessary. A folder
called `.github` may be hidden by your file manager — it is optional here.

Scroll down, click **Commit changes**.

**2. Deploy on Vercel.**

Go to <https://vercel.com>, **Sign up → Continue with GitHub**, authorise it.
Then **Add New… → Project**, find your repository, click **Import**, and click
**Deploy**. Change nothing — `vercel.json` already sets the build command, the
output directory and the API routing.

Two to three minutes later you get `https://your-app.vercel.app`.

**3. Check the API is live.** Open the site — the top strip should read **“Live
API connected”** with a green dot. Then open these directly, which are the good
screenshots for a report:

```
https://your-app.vercel.app/api/health
https://your-app.vercel.app/api/cases
https://your-app.vercel.app/api/cases/case-01      ← note: no "solution" field
```

**How it works.** Vercel does not run a long-lived Node process; it runs
functions. `api/index.js` exports the existing Express app as one, and
`vercel.json` rewrites `/api/*` to it while the built site is served from the
CDN. One consequence: each invocation may get a fresh instance, so the
in-memory session store behind `/api/progress` is per-instance rather than
shared. Scores are unaffected — the browser keeps its own copy — and running the
server locally behaves exactly as the README describes.

**Redeploying after a change.** Edit the file on GitHub (or re-upload it) and
commit; Vercel rebuilds automatically within a couple of minutes.

---

## E — Render (same thing, but needs a credit card)

This is the one where `GET /api/cases/case-01` genuinely answers over the
internet, hints are metered server-side, and submissions are graded by the
server instead of in the browser.

**1. Push to GitHub** (same as step 1 of route C).

**2. On <https://render.com>:** New → **Web Service** → connect the repository.

Render reads `render.yaml` and fills everything in. If it asks, the settings are:

| Field | Value |
|---|---|
| Runtime | Node |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Instance type | Free |

**3. Deploy.** In a few minutes you get `https://your-app.onrender.com`. Open it
and the status strip at the top of the page should read **“Live API connected”**
with a green dot — that is the client confirming it reached the backend.

Check the API directly for a screenshot in your report:

```
https://your-app.onrender.com/api/health
https://your-app.onrender.com/api/cases
https://your-app.onrender.com/api/cases/case-01      ← note: no "solution" field
```

**The free-plan catch:** the service sleeps after about 15 minutes with no
traffic and takes ~30 seconds to wake. Open your URL a minute before you
present, and it will be warm. Railway, Fly.io and Koyeb work the same way and
the included `Dockerfile` covers those if you prefer one of them.

---

## Running it on your own laptop for a live demo

No hosting needed at all:

```bash
npm install
npm start           # builds are already in client/dist after npm run build
```

Then open **<http://localhost:4000>**. One process serves both the API and the
site. Use `npm run dev` instead while you are editing code — that gives hot
reload on <http://localhost:5173>.

To let someone on the same wifi see it (a projector laptop, your phone), find
your machine's local address with `ipconfig` on Windows or `ifconfig | grep inet`
on macOS, and visit `http://<that-address>:4000` from the other device.

---

## Custom domain

All four hosts accept one. If you buy `toxicitydetective.in` or similar:

- **Netlify:** Site settings → Domain management → Add custom domain.
- **GitHub Pages:** Settings → Pages → Custom domain (then set the site's base
  back to `'/'` in `client/vite.config.js`, since you are no longer in a
  subfolder).
- **Render:** Settings → Custom Domains.

Each gives you an HTTPS certificate free.

---

## Troubleshooting

**Blank white page after deploying.** Almost always the asset path. Check that
`base: './'` is still set in `client/vite.config.js`, rebuild, redeploy.

**The status strip says “Local data mode” on Render.** The Node service is not
running — you probably deployed it as a *Static Site* rather than a *Web
Service*. The site still works; it is just using the bundled data.

**It says “Local data mode” on Netlify / GitHub Pages.** That is correct and
expected. Those hosts serve static files only; there is no Node process. Say so
in your report — it is a design feature, not a failure.

**The site works but fonts look wrong.** The page loads IBM Plex and Saira
Condensed from Google Fonts. On a network that blocks it, the browser falls back
to a system font. Everything else still works.

**Progress disappeared.** Scores are kept in your browser's local storage per
device, and in the server's memory when the API is live. A different browser, a
private window, or a Render restart starts a fresh score. That is intentional —
there are no accounts and no personal data.
