/**
 * DoseChart.jsx — the dose–response charts used on the evidence cards.
 *
 * Deliberate constraints, because a toxicology chart that misleads is worse
 * than no chart:
 *
 *  · One y-scale per chart, always. Where a case measures things in different
 *    units, the case splits them into two charts instead of using a second
 *    axis — a dual axis lets the author choose where two lines appear to
 *    cross, which is a way of asserting a relationship the data never showed.
 *  · A legend whenever there is more than one series, plus a direct label at
 *    the end of each line, so identity never depends on colour alone.
 *  · Every axis label names a value the chart actually reaches.
 *  · Text takes the interface ink colours; only the marks carry channel
 *    colour.
 *  · A table view of the same numbers is one click away, for screen readers,
 *    for printing, and for anyone who would rather read the figures.
 *
 * Hand-built in SVG rather than pulled from a charting library: four series
 * over four categorical conditions needs a polyline and a scale, and a library
 * would add far more weight than it removes.
 */

import { useId, useMemo, useState } from 'react';

const W = 660;
const H = 300;
const PAD = { top: 18, right: 96, bottom: 46, left: 58 };

const CHANNEL_VAR = {
  'dna-rna': 'var(--ch-dna)',
  protein: 'var(--ch-protein)',
  lipid: 'var(--ch-lipid)',
  carbohydrate: 'var(--ch-carb)'
};

const colorOf = (channel) => CHANNEL_VAR[channel] || 'var(--ink-2)';

/** Tick values that land on round numbers and include the top of the scale. */
function makeTicks(min, max) {
  const span = max - min;
  const rawStep = span / 4;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rawStep) || rawStep;
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) {
    ticks.push(Number(v.toFixed(6)));
  }
  if (ticks[ticks.length - 1] < max - 1e-9) ticks.push(max);
  return ticks;
}

const fmt = (v) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(1))));

export default function DoseChart({ dataset }) {
  const [active, setActive] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const titleId = useId();

  const { rows, series, xKey, type } = dataset;

  const { yMin, yMax, ticks, xOf, yOf, band } = useMemo(() => {
    const values = rows.flatMap((r) => series.map((s) => r[s.key])).filter((v) => typeof v === 'number');
    const dataMax = Math.max(...values);
    const dataMin = Math.min(...values);
    const top = dataset.yMax ?? Math.ceil((dataMax * 1.08) / 10) * 10;
    const bottom = dataset.yMin ?? 0;
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const bandW = innerW / rows.length;
    return {
      yMin: bottom,
      yMax: top,
      dataMin,
      ticks: makeTicks(bottom, top),
      band: bandW,
      xOf: (i) => PAD.left + bandW * (i + 0.5),
      yOf: (v) => PAD.top + innerH - ((v - bottom) / (top - bottom)) * innerH
    };
  }, [rows, series, dataset.yMax, dataset.yMin]);

  /* End-of-line labels, nudged apart so two close series cannot overprint. */
  const endLabels = useMemo(() => {
    if (type !== 'line') return [];
    const last = rows.length - 1;
    return series
      .map((s) => ({ key: s.key, channel: s.channel, value: rows[last][s.key], y: yOf(rows[last][s.key]) }))
      .sort((a, b) => a.y - b.y)
      .map((item, i, arr) => {
        const prev = arr[i - 1];
        const y = prev && item.y - prev.y < 14 ? prev.y + 14 : item.y;
        arr[i] = { ...item, y };
        return arr[i];
      });
  }, [rows, series, type, yOf]);

  const multi = series.length > 1;

  return (
    <figure className="chart" style={{ margin: 0 }}>
      <div className="chart__head">
        <div>
          <h4 className="chart__title" id={titleId}>
            {dataset.title}
          </h4>
          <p className="note" style={{ marginTop: 2 }}>
            {dataset.yLabel} · {dataset.xLabel}
          </p>
        </div>
        <span className="sim-tag">Simulated educational data</span>
      </div>

      {multi && (
        <div className="chart__legend">
          {series.map((s) => (
            <span key={s.key}>
              <i className="chart__swatch" style={{ background: colorOf(s.channel) }} />
              {s.key}
            </span>
          ))}
        </div>
      )}

      <div className="chart__plot">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby={titleId}
          onMouseLeave={() => setActive(null)}
        >
          {/* gridlines and y ticks */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={yOf(t)}
                y2={yOf(t)}
                style={{ stroke: 'var(--edge)' }}
                strokeWidth="1"
              />
              <text
                x={PAD.left - 10}
                y={yOf(t) + 4}
                textAnchor="end"
                style={{ fill: 'var(--ink-3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              >
                {fmt(t)}
              </text>
            </g>
          ))}

          {/* baseline */}
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={yOf(yMin)}
            y2={yOf(yMin)}
            style={{ stroke: 'var(--edge-strong)' }}
            strokeWidth="1"
          />

          {/* x labels */}
          {rows.map((r, i) => (
            <text
              key={r[xKey]}
              x={xOf(i)}
              y={H - PAD.bottom + 20}
              textAnchor="middle"
              style={{
                fill: active === i ? 'var(--ink)' : 'var(--ink-3)',
                fontSize: 11.5,
                fontFamily: 'var(--font-mono)'
              }}
            >
              {r[xKey]}
            </text>
          ))}

          {/* crosshair */}
          {active !== null && type === 'line' && (
            <line
              x1={xOf(active)}
              x2={xOf(active)}
              y1={PAD.top}
              y2={yOf(yMin)}
              style={{ stroke: 'var(--edge-strong)' }}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* marks */}
          {type === 'bar'
            ? rows.map((r, i) => {
                const s = series[0];
                const x = xOf(i) - Math.min(band * 0.46, 42);
                const w = Math.min(band * 0.92, 84);
                const y = yOf(r[s.key]);
                const h = Math.max(yOf(yMin) - y, 0.5);
                const rad = Math.min(4, h);
                return (
                  <path
                    key={r[xKey]}
                    d={`M${x} ${y + h} L${x} ${y + rad} Q${x} ${y} ${x + rad} ${y} L${x + w - rad} ${y} Q${x + w} ${y} ${x + w} ${y + rad} L${x + w} ${y + h} Z`}
                    style={{ fill: colorOf(s.channel), opacity: active === null || active === i ? 1 : 0.45 }}
                    stroke="none"
                  />
                );
              })
            : series.map((s) => (
                <g key={s.key}>
                  <polyline
                    points={rows.map((r, i) => `${xOf(i)},${yOf(r[s.key])}`).join(' ')}
                    fill="none"
                    style={{ stroke: colorOf(s.channel) }}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {rows.map((r, i) => (
                    <circle
                      key={r[xKey]}
                      cx={xOf(i)}
                      cy={yOf(r[s.key])}
                      r={active === i ? 5.5 : 4.5}
                      style={{ fill: colorOf(s.channel), stroke: 'var(--panel-2)' }}
                      strokeWidth="2"
                    />
                  ))}
                </g>
              ))}

          {/* direct end labels — identity without relying on colour */}
          {endLabels.map((l) => (
            <text
              key={l.key}
              x={W - PAD.right + 12}
              y={l.y + 4}
              style={{ fill: 'var(--ink-2)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            >
              {l.key.length > 15 ? `${l.key.slice(0, 14)}…` : l.key}
            </text>
          ))}

          {/* hit targets, wider than the marks */}
          {rows.map((r, i) => (
            <rect
              key={r[xKey]}
              x={PAD.left + band * i}
              y={PAD.top}
              width={band}
              height={H - PAD.top - PAD.bottom}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              tabIndex={0}
              role="button"
              aria-label={`${r[xKey]}: ${series.map((s) => `${s.key} ${r[s.key]}`).join(', ')}`}
            />
          ))}
        </svg>

        {active !== null && (
          <div
            className="chart__tip"
            style={{
              left: `${((PAD.left + band * (active + 0.5)) / W) * 100}%`,
              top: `${(yOf(Math.max(...series.map((s) => rows[active][s.key]))) / H) * 100}%`
            }}
          >
            <h5>{rows[active][xKey]}</h5>
            {series.map((s) => (
              <div className="chart__tiprow" key={s.key}>
                <span>
                  <i
                    className="chart__swatch"
                    style={{ background: colorOf(s.channel), display: 'inline-block', marginRight: 6 }}
                  />
                  {s.key}
                </span>
                <b>{fmt(rows[active][s.key])}</b>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chart__foot">
        <figcaption className="note" style={{ flex: '1 1 260px' }}>
          {dataset.caption}
        </figcaption>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setShowTable((v) => !v)}
          aria-expanded={showTable}
        >
          {showTable ? 'Hide data table' : 'Show data table'}
        </button>
      </div>

      {showTable && (
        <div className="table-scroll">
          <table className="data">
            <caption className="sr-only">
              {dataset.title} — simulated educational data
            </caption>
            <thead>
              <tr>
                <th scope="col">{dataset.xLabel}</th>
                {series.map((s) => (
                  <th scope="col" key={s.key}>
                    {s.key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[xKey]}>
                  <th scope="row" style={{ fontWeight: 500 }}>
                    {r[xKey]}
                  </th>
                  {series.map((s) => (
                    <td key={s.key}>{fmt(r[s.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
