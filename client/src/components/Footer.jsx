import { Link } from 'react-router-dom';
import { PROJECT } from '@shared/index.js';
import { useSession } from '../lib/session.jsx';

export default function Footer() {
  const { sessionId, mode } = useSession();
  return (
    <footer className="foot">
      <div className="wrap foot__grid">
        <div className="stack stack-3">
          <p className="eyebrow">{PROJECT.name}</p>
          <p className="note" style={{ maxWidth: '52ch' }}>
            An educational simulation. Every case, dataset and outcome on this site is invented for
            teaching and is clearly marked as simulated.
          </p>
          <div className="foot__links">
            <Link to="/cases">Case files</Link>
            <Link to="/biomolecules">Biomolecules</Link>
            <Link to="/cell">Cell lab</Link>
            <Link to="/mechanism-map">Mechanism map</Link>
            <Link to="/toxins">Toxin library</Link>
            <Link to="/quiz">Quiz</Link>
            <Link to="/about">About</Link>
          </div>
        </div>
        <div className="stack stack-3">
          <p className="eyebrow">Session</p>
          <p className="note">
            Data source: {mode === 'api' ? 'live REST API' : 'bundled local data'}
            <br />
            Session id: {sessionId.slice(0, 8)}…
            <br />
            Version {PROJECT.version}
          </p>
        </div>
      </div>
    </footer>
  );
}
