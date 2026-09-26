// What the server sends while the client-only simulation chunk loads.
//
// The simulation itself is `ssr:false` (p5 needs a browser), so this skeleton is
// all the initial HTML contains of the stage. It reuses the real layout classes
// — the top bar, `.simulation-stage`, the canvas frame, the parameters grid — so
// the boxes it reserves are the boxes the live simulation fills. Swapping one
// for the other must not move anything: that swap is what used to score a CLS
// above 0.25 on every /simulations/* page.
//
// No hooks and no translated text on purpose: it renders identically on the
// server and the client, and never flashes a string that then changes.

/** `slider` = a range input (tall field); `compact` = stepper, select, toggle, colour. */
export type SkeletonField = "slider" | "compact";

export default function SimulationSkeleton({
  fields = [],
}: {
  fields?: SkeletonField[];
}) {
  return (
    <div
      className="simulation-skeleton"
      role="status"
      aria-busy="true"
      aria-label="Loading simulation"
    >
      {/* Same boxes as TopSim: home, previous, title, next. */}
      <div className="top-nav-sim">
        <div className="top-nav-sim-back-to-home-wrapper">
          <SkeletonBackLink />
        </div>
        <div className="top-nav-sim-inner">
          <SkeletonBackLink withText />
          <h3>&nbsp;</h3>
          <SkeletonBackLink withText />
        </div>
      </div>

      <div className="simulation-stage">
        <div className="simulation-stage__canvas">
          <div className="screen simulation-skeleton__pulse" />
        </div>

        <aside className="simulation-stage__panel">
          <div className="simulation-controls simulation-skeleton__controls simulation-skeleton__pulse" />
          {fields.length > 0 && (
            <div className="inputs-container">
              {fields.map((kind, i) => (
                <div
                  key={i}
                  className={`sim-field simulation-skeleton__field simulation-skeleton__field--${kind} simulation-skeleton__pulse`}
                />
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// Mirrors Back.tsx: an icon box, plus the label that CSS hides below 768px.
function SkeletonBackLink({ withText = false }: { withText?: boolean }) {
  return (
    <div className="back-to-home">
      <span className="btn-glow back-to-home__link" aria-hidden="true">
        <span className="back-to-home__icon simulation-skeleton__icon" />
        {withText && (
          <span className="back-to-home__text back-to-home__text--responsive">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        )}
      </span>
    </div>
  );
}
