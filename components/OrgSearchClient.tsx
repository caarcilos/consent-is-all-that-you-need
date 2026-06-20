"use client";

import { useMemo, useState } from "react";
import { grants, orgs, participants } from "@/lib/syntheticData";
import { visibleProfile } from "@/lib/visibleProfile";
import { ParticipantCard } from "./ParticipantCard";
import { SearchIcon, ShieldIcon } from "./icons";

export function OrgSearchClient() {
  const [orgId, setOrgId] = useState(orgs[0].id);
  const [query, setQuery] = useState("");
  const selectedOrg = orgs.find((org) => org.id === orgId)!;
  const profiles = useMemo(() => {
    return participants
      .map((participant) => visibleProfile(participant, grants.filter((grant) => grant.participantId === participant.id && grant.orgId === orgId)))
      .filter((profile) => {
        if (!query.trim()) return profile.attributes.some((attribute) => attribute.visible);
        const needle = query.toLowerCase();
        return profile.attributes.some((attribute) => attribute.visible && attribute.value.toLowerCase().includes(needle));
      });
  }, [orgId, query]);

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
          <select id="org" value={orgId} onChange={(event) => setOrgId(event.target.value)}>
            {orgs.map((org) => <option value={org.id} key={org.id}>{org.name}</option>)}
          </select>
          <span className="context-badge">{selectedOrg.short}</span>
        </div>
      </section>

      <div className="trust-banner"><ShieldIcon /><strong>RLS enforced</strong><span>The database returned only attributes granted to {selectedOrg.name}.</span></div>

      <section className="search-toolbar">
        <div className="search-box"><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search only within fields you can see…" aria-label="Search visible participant fields" /></div>
        <div className="result-count"><strong>{profiles.length}</strong> participants visible</div>
      </section>

      <p className="search-explainer">Try searching for “biosecurity” as each org. Beacon can find it; the others cannot, because they were never granted that field.</p>

      <section className="card-grid" aria-live="polite">
        {profiles.map((profile) => <ParticipantCard profile={profile} key={profile.id} />)}
        {profiles.length === 0 && <div className="empty-state"><SearchIcon size={24} /><h2>No consented matches</h2><p>No visible field contains “{query}”. Hidden fields were not searched.</p></div>}
      </section>
    </>
  );
}
