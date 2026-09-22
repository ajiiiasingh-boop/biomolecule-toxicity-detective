/**
 * Pathway.jsx — the causal chain shown when a case is solved.
 *
 * The steps arrive one at a time, top to bottom, because that is the order the
 * biology happens in and the delay makes the sequence readable rather than
 * decorative. Under prefers-reduced-motion the CSS collapses the animation to
 * nothing and all steps are simply present.
 */

export default function Pathway({ steps }) {
  return (
    <ol className="pathway" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {steps.map((step, i) => (
        <li
          key={step}
          className="pathway__step"
          style={{ animationDelay: `${i * 140}ms` }}
        >
          <span className="pathway__rail" aria-hidden="true">
            <span className="pathway__node" />
            {i < steps.length - 1 && <span className="pathway__line" />}
          </span>
          <span className="pathway__text">{step}</span>
        </li>
      ))}
    </ol>
  );
}
