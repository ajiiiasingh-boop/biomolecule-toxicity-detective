import { Link } from 'react-router-dom';
import { Arrow } from '../components/Glyphs.jsx';

export default function NotFound() {
  return (
    <div className="wrap stack stack-5" style={{ paddingBlock: 'var(--s-8)' }}>
      <p className="eyebrow">Error 404 · file not found</p>
      <h1 className="display" style={{ fontSize: 'var(--t-h1)' }}>
        No such case file
      </h1>
      <p className="lede">
        That record is not in the archive. The six cases in series BTD‑2041 are all listed on the case
        files page.
      </p>
      <div className="row">
        <Link to="/cases" className="btn btn--key">
          Open the case files
          <Arrow size={14} className="btn__arrow" />
        </Link>
        <Link to="/" className="btn btn--ghost">
          Back to the briefing
        </Link>
      </div>
    </div>
  );
}
