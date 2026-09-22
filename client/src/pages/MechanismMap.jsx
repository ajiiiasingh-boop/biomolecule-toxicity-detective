import { useEffect, useState } from 'react';
import { fetchMechanismMap } from '../lib/api.js';
import { ArrowDown } from '../components/Glyphs.jsx';
import { Disclaimer, PageHead } from '../components/Bits.jsx';

export default function MechanismMap() {
  const [map, setMap] = useState(null);
  const [openId, setOpenId] = useState('damage');

  useEffect(() => {
    fetchMechanismMap().then((d) => setMap(d.mechanismMap));
  }, []);

  if (!map) return <p className="wrap empty">Loading the mechanism map…</p>;

  const open = map.stages.find((s) => s.id === openId);

  return (
    <div className="wrap stack stack-6">
      <PageHead eyebrow="Toxicity mechanism map" title={map.title} lede={map.intro} />

      <div className="map-layout">
        <div className="map-flow">
          {map.stages.map((stage, i) => (
            <div key={stage.id}>
              <button
                type="button"
                className="map-stage"
                aria-pressed={openId === stage.id}
                onClick={() => setOpenId(stage.id)}
              >
                <span className="map-stage__idx">{String(stage.index).padStart(2, '0')}</span>
                <span>
                  <span className="map-stage__name" style={{ display: 'block' }}>
                    {stage.name}
                  </span>
                  <span className="map-stage__short">{stage.short}</span>
                </span>
                <span className="map-stage__time">{stage.timescale}</span>
              </button>
              {i < map.stages.length - 1 && (
                <div className="map-arrow" aria-hidden="true">
                  <ArrowDown size={16} />
                </div>
              )}
            </div>
          ))}
        </div>

        {open && (
          <article className="panel panel--pad stack stack-5" aria-live="polite">
            <div>
              <p className="eyebrow">
                Stage {String(open.index).padStart(2, '0')} · {open.timescale}
              </p>
              <h2 className="display" style={{ fontSize: 'var(--t-h2)', marginTop: 4 }}>
                {open.name}
              </h2>
            </div>

            <p className="prose">{open.body}</p>

            <div className="stack stack-3">
              <p className="subhead">Worth knowing</p>
              <ul className="bullets">
                {open.detail.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="stack stack-3">
              <p className="subhead">What resists it here</p>
              <div className="marker-row">
                {open.defences.map((d) => (
                  <span className="chip" key={d}>
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="stack stack-3">
              <p className="subhead">What is measured here</p>
              <div className="marker-row">
                {open.markers.map((m) => (
                  <span className="chip" key={m}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </article>
        )}
      </div>

      <Disclaimer compact />
    </div>
  );
}
