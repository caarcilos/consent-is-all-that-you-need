"use client";

import { useEffect, useMemo, useState } from "react";
import {
  accessEvents as fixtureEvents,
  grants as fixtureGrants,
  participants as fixtureParticipants,
} from "@/lib/syntheticData";
import {
  ATTRIBUTE_KEYS,
  type AccessEvent,
  type AttributeKey,
  type Grant,
  type Org,
  type Participant,
} from "@/lib/types";
import { AccessLogFeed } from "./AccessLogFeed";
import { GrantMatrix } from "./GrantMatrix";
import { useDemo } from "./DemoProvider";
import { EyeIcon, ShieldIcon } from "./icons";

type GlassBoxResponse = {
  participant: {
    id: string;
    handle: string;
    initials: string;
    tone: string;
    attributes: Partial<Record<AttributeKey, {
      value: string;
      sensitivity: "standard" | "sensitive";
    }>>;
  };
  grants: Array<{
    id: string;
    org_id: string;
    attribute_key: AttributeKey | "*";
    basis: string;
  }>;
  access_log: Array<{
    id: string;
    org_id: string;
    attribute_key: AttributeKey;
    accessed_at: string;
  }>;
};

type GlassBox = {
  participant: Participant;
  grants: Grant[];
  events: AccessEvent[];
};

function normalizeGlassBox(data: GlassBoxResponse): GlassBox {
  return {
    participant: {
      id: data.participant.id,
      handle: data.participant.handle,
      initials: data.participant.initials,
      tone: data.participant.tone,
      attributes: ATTRIBUTE_KEYS.map((key) => ({
        key,
        value: data.participant.attributes[key]?.value ?? "",
        sensitivity: data.participant.attributes[key]?.sensitivity
          ?? (key === "email" || key === "notes" ? "sensitive" : "standard"),
      })),
    },
    grants: data.grants.map((grant) => ({
      participantId: data.participant.id,
      orgId: grant.org_id,
      attributeKey: grant.attribute_key,
      basis: grant.basis,
    })),
    events: data.access_log.map((event) => ({
      id: event.id,
      participantId: data.participant.id,
      orgId: event.org_id,
      attributeKey: event.attribute_key,
      accessedAt: event.accessed_at,
    })),
  };
}

export function ParticipantViewClient() {
  const {
    status,
    error,
    client,
    orgs,
    participants,
    refreshDirectory,
    revision,
  } = useDemo();
  const [participantId, setParticipantId] = useState(participants[0]?.id ?? "");
  const [glassBox, setGlassBox] = useState<GlassBox | null>(null);
  const [draft, setDraft] = useState<Record<AttributeKey, string>>(
    Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, ""])) as Record<AttributeKey, string>,
  );
  const [loading, setLoading] = useState(status === "connecting");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!participants.some((participant) => participant.id === participantId)) {
      setParticipantId(participants[0]?.id ?? "");
    }
  }, [participantId, participants]);

  const fixtureGlassBox = useMemo<GlassBox | null>(() => {
    const participant = fixtureParticipants.find((item) => item.id === participantId);
    if (!participant) return null;
    return {
      participant,
      grants: fixtureGrants.filter((grant) => grant.participantId === participantId),
      events: fixtureEvents
        .filter((event) => event.participantId === participantId)
        .sort((a, b) => b.accessedAt.localeCompare(a.accessedAt)),
    };
  }, [participantId]);

  useEffect(() => {
    if (!participantId) return;
    if (status === "fixture") {
      setGlassBox(fixtureGlassBox);
      setLoading(false);
      return;
    }
    if (status !== "ready" || !client) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      const { data, error: glassError } = await client.rpc("participant_glass_box", {
        p_participant_id: participantId,
      });
      if (!active) return;
      setGlassBox(glassError ? null : normalizeGlassBox(data as GlassBoxResponse));
      setLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, [client, fixtureGlassBox, participantId, revision, status]);

  useEffect(() => {
    if (!glassBox) return;
    setDraft(Object.fromEntries(
      glassBox.participant.attributes.map((attribute) => [attribute.key, attribute.value]),
    ) as Record<AttributeKey, string>);
  }, [glassBox]);

  const reloadGlassBox = async () => {
    if (!client || !participantId) return;
    const { data, error: glassError } = await client.rpc("participant_glass_box", {
      p_participant_id: participantId,
    });
    if (glassError) throw glassError;
    setGlassBox(normalizeGlassBox(data as GlassBoxResponse));
  };

  const saveProfile = async () => {
    if (!client || !glassBox) return;
    setSavingProfile(true);
    setSavedMessage(null);
    try {
      for (const key of ATTRIBUTE_KEYS) {
        const current = glassBox.participant.attributes.find((attribute) => attribute.key === key)?.value;
        if (draft[key] === current) continue;
        const { error: updateError } = await client.rpc("update_participant_attribute", {
          p_participant_id: participantId,
          p_key: key,
          p_value: draft[key],
        });
        if (updateError) throw updateError;
      }
      await reloadGlassBox();
      await refreshDirectory();
      setSavedMessage("Profile saved");
    } catch {
      setSavedMessage("Could not save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleGrant = async (
    org: Org,
    key: AttributeKey,
    existingGrant: Grant | undefined,
  ) => {
    if (!client) return;
    const cellId = `${org.id}:${key}`;
    setSavingCell(cellId);
    setSavedMessage(null);
    const { error: grantError } = await client.rpc("set_consent_grant", {
      p_participant_id: participantId,
      p_org_id: org.id,
      p_attribute_key: key,
      p_basis: existingGrant?.basis ?? "Granted in this demo workspace",
      p_enabled: !existingGrant,
    });
    if (grantError) {
      setSavedMessage("Could not change grant");
    } else {
      await reloadGlassBox();
      setSavedMessage(existingGrant ? "Grant revoked" : "Grant added");
    }
    setSavingCell(null);
  };

  if (status === "connecting" || loading || !glassBox) {
    return (
      <section className="demo-state">
        <div className="eyebrow">Anonymous workspace</div>
        <h1>{status === "error" ? "Could not load the participant view" : "Opening the glass box…"}</h1>
        {error && <p>{error}</p>}
      </section>
    );
  }

  const { participant, grants, events } = glassBox;
  const name = participant.attributes.find((item) => item.key === "name")?.value ?? participant.handle;
  const orgCount = new Set(grants.map((grant) => grant.orgId)).size;

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
            {participants.map((item) => <option value={item.id} key={item.id}>{item.name} · @{item.handle}</option>)}
          </select>
          <span className={`context-badge avatar ${participant.tone}`}>{participant.initials}</span>
        </div>
      </section>

      {status === "fixture"
        ? <div className="mode-banner"><strong>Fixture mode</strong><span>Connect Supabase to edit and preserve this profile.</span></div>
        : <div className="trust-banner"><ShieldIcon /><strong>Your private copy</strong><span>Profile and grant changes survive refreshes in this browser.</span></div>}

      <section className="participant-summary">
        <div className={`large-avatar ${participant.tone}`}>{participant.initials}</div>
        <div><p>Acting as</p><h2>{name}</h2><span>@{participant.handle}</span></div>
        <div className="summary-stat"><ShieldIcon /><strong>{orgCount}</strong><span>organizations with access</span></div>
        <div className="summary-stat"><EyeIcon /><strong>{events.length}</strong><span>recorded attribute reads</span></div>
      </section>

      {status === "ready" && (
        <section className="panel profile-editor-panel">
          <div className="panel-heading">
            <div><div className="eyebrow">Persistent synthetic profile</div><h2>Edit this participant</h2></div>
            <p>These changes belong only to your anonymous workspace. Other visitors keep their own independent copy.</p>
          </div>
          <div className="profile-editor">
            {ATTRIBUTE_KEYS.map((key) => (
              <label key={key}>
                <span>{key}{(key === "email" || key === "notes") && <i>Sensitive</i>}</span>
                {key === "notes"
                  ? <textarea value={draft[key]} onChange={(event) => setDraft((value) => ({ ...value, [key]: event.target.value }))} />
                  : <input value={draft[key]} onChange={(event) => setDraft((value) => ({ ...value, [key]: event.target.value }))} />}
              </label>
            ))}
            <div className="editor-actions">
              <button onClick={() => void saveProfile()} disabled={savingProfile}>
                {savingProfile ? "Saving…" : "Save profile"}
              </button>
              {savedMessage && <span role="status">{savedMessage}</span>}
            </div>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel-heading"><div><div className="eyebrow">Permission map</div><h2>Who can see me &amp; why</h2></div><p>{status === "ready" ? "Click any cell to grant or revoke that field. Changes apply immediately to the organization lens." : "Every filled cell corresponds to an explicit consent grant."}</p></div>
        <GrantMatrix
          orgs={orgs}
          participantGrants={grants}
          editable={status === "ready"}
          savingCell={savingCell}
          onToggle={(org, key, grant) => void toggleGrant(org, key, grant)}
        />
      </section>

      <section className="panel log-panel">
        <div className="panel-heading"><div><div className="eyebrow">Your audit trail</div><h2>Who has viewed me</h2></div><p>Reads belong in your line of sight. Each attribute access is recorded at the database boundary.</p></div>
        <AccessLogFeed events={events} orgs={orgs} />
      </section>
    </>
  );
}
