"use client";

import { useEffect, useMemo, useState } from "react";
import { grants as fixtureGrants, participants as fixtureParticipants } from "@/lib/syntheticData";
import { ATTRIBUTE_KEYS, type AttributeKey } from "@/lib/types";
import { visibleProfile, type VisibleProfile } from "@/lib/visibleProfile";
import { ParticipantCard } from "./ParticipantCard";
import { useDemo } from "./DemoProvider";
import { SearchIcon, ShieldIcon } from "./icons";

type SearchRow = {
  participant_id: string;
  handle: string;
  initials: string;
  tone: string;
  visible_attributes: Partial<Record<AttributeKey, {
    value: string;
    sensitivity: "standard" | "sensitive";
  }>>;
};

function rowToProfile(row: SearchRow): VisibleProfile {
  return {
    id: row.participant_id,
    handle: row.handle,
    initials: row.initials,
    tone: row.tone,
    attributes: ATTRIBUTE_KEYS.map((key) => {
      const attribute = row.visible_attributes[key];
      return {
        key,
        value: attribute?.value ?? "",
        sensitivity: attribute?.sensitivity
          ?? (key === "email" || key === "notes" ? "sensitive" : "standard"),
        visible: Boolean(attribute),
      };
    }),
  };
}

export function OrgSearchClient() {
  const {
    status,
    error,
    client,
    orgs,
    refreshDirectory,
    revision,
  } = useDemo();
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<VisibleProfile[]>([]);
  const [loading, setLoading] = useState(status === "connecting");
  const [orgName, setOrgName] = useState(orgs[0]?.name ?? "");
  const [savingOrg, setSavingOrg] = useState(false);

  useEffect(() => {
    if (!orgs.some((org) => org.id === orgId)) {
      setOrgId(orgs[0]?.id ?? "");
    }
  }, [orgId, orgs]);

  const selectedOrg = orgs.find((org) => org.id === orgId) ?? orgs[0];
  useEffect(() => setOrgName(selectedOrg?.name ?? ""), [selectedOrg?.name]);

  const fixtureProfiles = useMemo(() => {
    if (!selectedOrg) return [];
    const needle = query.trim().toLowerCase();
    return fixtureParticipants
      .map((participant) => visibleProfile(
        participant,
        fixtureGrants.filter((grant) =>
          grant.participantId === participant.id
          && grant.orgId === selectedOrg.id),
      ))
      .filter((profile) =>
        profile.attributes.some((attribute) =>
          attribute.visible
          && (!needle || attribute.value.toLowerCase().includes(needle))),
      );
  }, [query, selectedOrg]);

  useEffect(() => {
    if (status === "fixture") {
      setProfiles(fixtureProfiles);
      setLoading(false);
      return;
    }
    if (status !== "ready" || !client || !orgId) return;

    let active = true;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      const { data, error: searchError } = await client.rpc("search_pool", {
        p_org_id: orgId,
        p_query: query,
      });
      if (!active) return;
      if (searchError) {
        setProfiles([]);
      } else {
        setProfiles((data as SearchRow[]).map(rowToProfile));
      }
      setLoading(false);
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [client, fixtureProfiles, orgId, query, revision, status]);

  const saveOrgName = async () => {
    if (!client || !selectedOrg || !orgName.trim()) return;
    setSavingOrg(true);
    const { error: updateError } = await client.rpc("update_demo_org_name", {
      p_org_id: selectedOrg.id,
      p_name: orgName,
    });
    if (!updateError) await refreshDirectory();
    setSavingOrg(false);
  };

  if (!selectedOrg) return <DemoState status={status} error={error} />;

  return (
    <>
      <section className="view-intro">
        <div>
          <div className="eyebrow">Organization lens</div>
          <h1>Browse the shared pool</h1>
          <p>You can only discover and read fields participants have granted to your organization.</p>
        </div>
        <div className="context-picker">
          <label htmlFor="org">Viewing as</label>
          <select id="org" value={selectedOrg.id} onChange={(event) => setOrgId(event.target.value)}>
            {orgs.map((org) => <option value={org.id} key={org.id}>{org.name}</option>)}
          </select>
          <span className="context-badge">{selectedOrg.short}</span>
        </div>
      </section>

      {status === "fixture"
        ? <div className="mode-banner"><strong>Fixture mode</strong><span>Add Supabase environment variables to enable persistent editing.</span></div>
        : <div className="trust-banner"><ShieldIcon /><strong>Private workspace · RLS enforced</strong><span>Changes persist for this anonymous browser session.</span></div>}
      {status === "error" && <div className="error-banner">{error}</div>}

      {status === "ready" && (
        <details className="edit-disclosure">
          <summary>Edit this fictional organization</summary>
          <div className="inline-editor">
            <label htmlFor="org-name">Organization name</label>
            <input id="org-name" value={orgName} onChange={(event) => setOrgName(event.target.value)} />
            <button onClick={() => void saveOrgName()} disabled={savingOrg || !orgName.trim()}>
              {savingOrg ? "Saving…" : "Save name"}
            </button>
          </div>
        </details>
      )}

      <section className="search-toolbar">
        <div className="search-box"><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search only within fields you can see…" aria-label="Search visible participant fields" /></div>
        <div className="result-count"><strong>{profiles.length}</strong> participants visible</div>
      </section>

      <p className="search-explainer">Try searching for “biosecurity” as each org. Beacon can find it; the others cannot, because they were never granted that field.</p>

      <section className="card-grid" aria-live="polite" aria-busy={loading}>
        {loading && <div className="loading-state">Reading consented fields…</div>}
        {!loading && profiles.map((profile) => <ParticipantCard profile={profile} key={profile.id} />)}
        {!loading && profiles.length === 0 && <div className="empty-state"><SearchIcon size={24} /><h2>No consented matches</h2><p>No visible field contains “{query}”. Hidden fields were not searched.</p></div>}
      </section>
    </>
  );
}

function DemoState({ status, error }: { status: string; error: string | null }) {
  return (
    <section className="demo-state">
      <div className="eyebrow">Anonymous workspace</div>
      <h1>{status === "error" ? "Could not start the demo" : "Preparing your private copy…"}</h1>
      {error && <p>{error}</p>}
    </section>
  );
}
