import Link from "next/link";

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="eyebrow">A practical example · synthetic data</div>
        <h1>
          Consent you can
          <br />
          <em>actually see.</em>
        </h1>
        <p className="hero-copy">
          A small build I made to think through one delicate part of a shared,
          cross-org talent database: letting people control — and inspect —
          exactly who can read their data. It runs on eight fictional
          participants and three fictional organizations. It&rsquo;s a teaching
          model for a single idea, not a product or an ATS, and it deliberately
          leaves most of a real system unbuilt.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/org-search">
            Explore as an organization <span>→</span>
          </Link>
          <Link className="button secondary" href="/participant">
            See the participant view
          </Link>
        </div>
      </section>

      <section
        className="thesis-strip"
        aria-label="What this build demonstrates"
      >
        <div>
          <span>01</span>
          <h2>Consent is data</h2>
          <p>
            Every grant names a field, an organization, and a human-readable
            reason.
          </p>
        </div>
        <div>
          <span>02</span>
          <h2>The database enforces it</h2>
          <p>
            Profile fields are rows, so PostgreSQL RLS is the real permission
            boundary — not the UI.
          </p>
        </div>
        <div>
          <span>03</span>
          <h2>Reads leave footprints</h2>
          <p>
            Every attribute read is logged and returned to the person it
            concerns.
          </p>
        </div>
      </section>

      <section className="model-section">
        <div>
          <div className="eyebrow">The modeling choice</div>
          <h2>
            Field-level consent,
            <br />
            made row-level.
          </h2>
        </div>
        <div className="model-copy">
          <p>
            Postgres secures rows, not columns. So each profile field is stored
            as its own row. That turns &ldquo;can this org see this
            field?&rdquo; into an honest RLS question instead of application
            filtering.
          </p>
          <p>
            Search runs over the same gated rows, so an organization can&rsquo;t
            search, filter, or rank on data it can&rsquo;t see. No second
            permission system required.
          </p>
          <div className="code-chip">
            <span>participant_attributes</span>
            <span>→</span>
            <span>consent_grants</span>
            <span>→</span>
            <strong>RLS</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
