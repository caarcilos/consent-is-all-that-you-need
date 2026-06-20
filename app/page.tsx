import Link from "next/link";

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="eyebrow"><span className="live-dot" /> Consent-driven by design</div>
        <h1>A talent pool with<br /><em>the lights on.</em></h1>
        <p className="hero-copy">
          Organizations see only what each participant has granted. Participants see
          exactly who can see them, why, and every time their record is read.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/org-search">Explore as an organization <span>→</span></Link>
          <Link className="button secondary" href="/participant">See the participant view</Link>
        </div>
      </section>

      <section className="thesis-strip" aria-label="Core product properties">
        <div><span>01</span><h2>Consent is data</h2><p>Every grant has a field, an organization, and a human-readable reason.</p></div>
        <div><span>02</span><h2>The database enforces it</h2><p>Profile fields are rows, so PostgreSQL RLS is the real permission boundary.</p></div>
        <div><span>03</span><h2>Reads leave footprints</h2><p>Every attribute read is logged and returned to the person it concerns.</p></div>
      </section>

      <section className="model-section">
        <div>
          <div className="eyebrow">The modeling choice</div>
          <h2>Field-level consent,<br />made row-level.</h2>
        </div>
        <div className="model-copy">
          <p>Postgres secures rows, not columns. So each profile field is stored as its own row. That makes “can this org see this field?” an honest RLS question.</p>
          <p>Search runs over the same gated rows. An organization cannot search, filter, or rank on data it cannot see. No second permission system required.</p>
          <div className="code-chip"><span>participant_attributes</span><span>→</span><span>consent_grants</span><span>→</span><strong>RLS</strong></div>
        </div>
      </section>

      <section className="no-ai-note">
        <span className="no-ai-icon">✦</span>
        <div><div className="eyebrow">A deliberate omission</div><h2>No AI summary.</h2></div>
        <p>In a system about legible, consented access, an opaque generative layer works against the thesis. Record-backed determinism is the responsible default.</p>
      </section>
    </main>
  );
}
