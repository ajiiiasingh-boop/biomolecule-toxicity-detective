/**
 * Chrome.jsx — the persistent header.
 *
 * Two rows, on the model of a laboratory analyser: a thin status strip that
 * reports the live state of the session (data source, score, cases solved),
 * and below it the navigation and the standing call to action. On narrow
 * screens the links collapse into a disclosure panel; the score stays visible
 * at all widths, because it is the thing a player checks most often.
 */

import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSession } from '../lib/session.jsx';
import { Arrow, BrandMark, Menu } from './Glyphs.jsx';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/cases', label: 'Case files' },
  { to: '/biomolecules', label: 'Biomolecules' },
  { to: '/cell', label: 'Cell lab' },
  { to: '/mechanism-map', label: 'Mechanism map' },
  { to: '/toxins', label: 'Toxin library' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/about', label: 'About' }
];

export default function Chrome() {
  const [open, setOpen] = useState(false);
  const { score, casesSolved, casesTotal, mode } = useSession();
  const location = useLocation();

  const sourceLabel =
    mode === 'api' ? 'Live API connected' : mode === 'connecting' ? 'Connecting…' : 'Local data mode';

  return (
    <header className="chrome">
      <div className="wrap chrome__strip">
        <span>
          <i className="dot" data-state={mode === 'api' ? 'online' : 'offline'} />
          <span className="chrome__source">{sourceLabel}</span>
        </span>
        <span className="chrome__stat">
          Detective score <b>{score}</b>
          <span aria-hidden="true" style={{ opacity: 0.35, margin: '0 10px' }}>
            /
          </span>
          Cases solved{' '}
          <b>
            {casesSolved}/{casesTotal}
          </b>
        </span>
      </div>

      <div className="wrap chrome__bar">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <BrandMark className="brand__mark" />
          <span className="brand__text">
            <span className="brand__name">Toxicity Detective</span>
            <span className="brand__sub">Biomolecule investigation unit</span>
          </span>
        </Link>

        <nav className={open ? 'nav nav--open' : 'nav'} aria-label="Main">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="chrome__actions">
          <Link
            to="/cases"
            className="btn btn--key btn--sm"
            onClick={() => setOpen(false)}
            aria-current={location.pathname === '/cases' ? 'page' : undefined}
          >
            Start investigation
            <Arrow size={14} className="btn__arrow" />
          </Link>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <Menu />
          </button>
        </div>
      </div>
    </header>
  );
}
