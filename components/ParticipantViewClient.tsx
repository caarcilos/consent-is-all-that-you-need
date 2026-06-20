"use client";

import { useState } from "react";
import { accessEvents, grants, participants } from "@/lib/syntheticData";
import { AccessLogFeed } from "./AccessLogFeed";
import { GrantMatrix } from "./GrantMatrix";
import { EyeIcon, ShieldIcon } from "./icons";

export function ParticipantViewClient() {
  const [participantId, setParticipantId] = useState(participants[0].id);
  const participant = participants.find((item) => item.id === participantId)!;
  const name = participant.attributes.find((item) => item.key === "name")!.value;
  const participantGrants = grants.filter((grant) => grant.participantId === participantId);
  const events = accessEvents
    .filter((event) => event.participantId === participantId)
    .sort((a, b) => b.accessedAt.localeCompare(a.accessedAt));
  const orgCount = new Set(participantGrants.map((grant) => grant.orgId)).size;

  return (
    <>
      <section className="view-intro participant-intro">
        <div>
          <div className="eyebrow">Participant lens</div>
          <h1>Your visibility, in plain sight</h1>
          <p>See who can access each part of your profile, why they can see it, and what they have viewed.</p>
        </div>
        <div className="context-picker">
          <label htmlFor="participant">Viewing as</label>
          <select id="participant" value={participantId} onChange={(event) => setParticipantId(event.target.value)}>
            {participants.map((item) => <option value={item.id} key={item.id}>{item.attributes[0].value} · @{item.handle}</option>)}
          </select>
          <span className={`context-badge avatar ${participant.tone}`}>{participant.initials}</span>
        </div>
      </section>

      <section className="participant-summary">
        <div className={`large-avatar ${participant.tone}`}>{participant.initials}</div>
        <div><p>Signed in as</p><h2>{name}</h2><span>@{participant.handle}</span></div>
        <div className="summary-stat"><ShieldIcon /><strong>{orgCount}</strong><span>organizations with access</span></div>
        <div className="summary-stat"><EyeIcon /><strong>{events.length}</strong><span>recorded attribute reads</span></div>
      </section>

      <section className="panel">
        <div className="panel-heading"><div><div className="eyebrow">Permission map</div><h2>Who can see me &amp; why</h2></div><p>Every filled cell corresponds to an explicit consent grant. Sensitive fields are marked with a dot.</p></div>
        <GrantMatrix participantGrants={participantGrants} />
      </section>

      <section className="panel log-panel">
        <div className="panel-heading"><div><div className="eyebrow">Your audit trail</div><h2>Who has viewed me</h2></div><p>Reads belong in your line of sight. Each attribute access is recorded at the database boundary.</p></div>
        <AccessLogFeed events={events} />
      </section>
    </>
  );
}
