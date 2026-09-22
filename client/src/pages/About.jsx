import { Link } from 'react-router-dom';
import { PROJECT, CASES, BIOMOLECULES, QUIZ, TOXIN_CATEGORIES } from '@shared/index.js';
import { useSession } from '../lib/session.jsx';
import { Arrow } from '../components/Glyphs.jsx';
import { PageHead } from '../components/Bits.jsx';

export default function About() {
  const { mode, sessionId } = useSession();

  return (
    <div className="wrap stack stack-6">
      <PageHead
        eyebrow="About this project"
        title="What this is, and what it is not"
        lede="An interactive teaching piece about biomolecular toxicology, built as an investigation rather than a set of pages to read."
      />

      <section className="panel panel--pad stack stack-4" style={{ borderColor: 'rgba(250,178,25,0.4)' }}>
        <p className="eyebrow" style={{ color: 'var(--warn)' }}>
          Educational simulation — please read
        </p>
        <p className="prose" style={{ color: 'var(--ink)', maxWidth: '72ch' }}>
          {PROJECT.disclaimer}
        </p>
        <ul className="bullets" data-channel="carbohydrate">
          <li>
            Every case, specimen, compound code and numerical value on this site is invented. The
            datasets were written by hand to behave the way real dose–response data behaves, so that
            reading them teaches something transferable — but they are not measurements and are not
            drawn from any publication.
          </li>
          <li>
            The biology is simplified on purpose. Real lesions overlap: a toxicant that peroxidises
            lipids will also damage proteins and DNA, and a real investigation rarely resolves to one
            clean mechanism. Each case here is built around one dominant mechanism so the reasoning
            can be learned in isolation first.
          </li>
          <li>
            Nothing here is clinical, diagnostic or regulatory guidance, and nothing here describes
            how to obtain, prepare, concentrate or handle any substance. The toxin library covers
            mechanisms of action inside a cell and stops there.
          </li>
        </ul>
      </section>

      <section className="stack stack-4">
        <p className="subhead">Why it is built as a game</p>
        <div className="prose">
          <p>
            Toxicology is usually taught as a list: here are the mechanisms, here are the markers,
            here are the consequences. The trouble with the list is that it is presented in the order
            a textbook finds convenient, which is the reverse of the order a real investigator meets
            it in. In practice you start at the end of the chain — something is wrong with a cell or a
            person — and you have to work backwards to the molecule.
          </p>
          <p>
            So the cases here hand over the evidence in the order it would actually arrive: an
            observation, a dataset, a structural clue, an effect. The same facts a chapter would list
            are all present, but they have to be used rather than read, and a wrong conclusion sends
            you back to the specific piece of evidence that rules it out instead of simply being
            marked incorrect.
          </p>
          <p>
            The content is pitched at a first-year biomedical or biomedical-engineering audience:
            enough real vocabulary — Vmax and Km, 8-oxo-dG, bis-allylic hydrogens, GSH:GSSG — that the
            terms are recognisable afterwards, with each one explained where it first appears.
          </p>
        </div>
      </section>

      <section className="stack stack-4">
        <p className="subhead">What is in it</p>
        <div className="stat-grid">
          <div className="stat">
            <b>{CASES.length}</b>
            <span>Investigation cases</span>
          </div>
          <div className="stat">
            <b>{BIOMOLECULES.length}</b>
            <span>Database entries</span>
          </div>
          <div className="stat">
            <b>{TOXIN_CATEGORIES.reduce((n, c) => n + c.entries.length, 0)}</b>
            <span>Toxin library entries</span>
          </div>
          <div className="stat">
            <b>{QUIZ.length}</b>
            <span>Quiz questions</span>
          </div>
        </div>
      </section>

      <section className="stack stack-4">
        <p className="subhead">How it is built</p>
        <div className="prose">
          <p>
            A React single-page application talks to an Express REST API. Both import the same data
            layer, so the cases, the taxonomy of biomolecules and mechanisms, and the scoring rules
            have exactly one definition and cannot drift apart.
          </p>
          <p>
            The API is the part that matters for the game: it serves each case with the answer key
            removed, grades submissions server-side, meters the hints, marks the quiz and keeps the
            session score. When no API is reachable — as in the standalone build — the client detects
            that on startup and falls back to computing the same answers locally, so the site still
            works as a static page.
          </p>
          <p>
            The charts are hand-built SVG rather than a charting library, with one y-scale per chart,
            a legend and direct labels whenever there is more than one series, and a table view of the
            same numbers for anyone who would rather read them. The illustrations — the cell, the
            biomolecule glyphs, the pathway diagrams — are drawn inline as SVG for the same reason:
            they have to mean something specific, and stock icons do not.
          </p>
        </div>
        <div className="row">
          <span className="chip">React</span>
          <span className="chip">React Router</span>
          <span className="chip">Vite</span>
          <span className="chip">Express</span>
          <span className="chip">Node test runner</span>
          <span className="chip">Hand-written CSS</span>
          <span className="chip">Inline SVG</span>
        </div>
      </section>

      <section className="panel panel--pad stack stack-3">
        <p className="eyebrow">This session</p>
        <p className="note">
          Data source: {mode === 'api' ? 'live REST API' : 'bundled local data (no API reachable)'}
          <br />
          Session id: {sessionId}
          <br />
          No account, no personal data. The session id is generated in your browser purely so the
          server can keep a score against it, and progress is mirrored in this browser&rsquo;s local
          storage.
        </p>
      </section>

      <div className="row">
        <Link to="/cases" className="btn btn--key">
          Start investigating
          <Arrow size={14} className="btn__arrow" />
        </Link>
        <Link to="/biomolecules" className="btn">
          Biomolecule database
        </Link>
      </div>
    </div>
  );
}
