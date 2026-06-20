import type { AccessEvent, Grant, Org, Participant } from "./types";

export const orgs: Org[] = [
  { id: "10000000-0000-0000-0000-000000000001", slug: "aqueduct", name: "Aqueduct Research", short: "AR" },
  { id: "10000000-0000-0000-0000-000000000002", slug: "beacon", name: "Beacon Policy", short: "BP" },
  { id: "10000000-0000-0000-0000-000000000003", slug: "lattice", name: "Lattice Labs", short: "LL" },
];

const profile = (
  id: string,
  handle: string,
  initials: string,
  tone: string,
  name: string,
  email: string,
  location: string,
  skills: string,
  seeking: string,
  notes: string,
): Participant => ({
  id,
  handle,
  initials,
  tone,
  attributes: [
    { key: "name", value: name, sensitivity: "standard" },
    { key: "email", value: email, sensitivity: "sensitive" },
    { key: "location", value: location, sensitivity: "standard" },
    { key: "skills", value: skills, sensitivity: "standard" },
    { key: "seeking", value: seeking, sensitivity: "standard" },
    { key: "notes", value: notes, sensitivity: "sensitive" },
  ],
});

export const participants: Participant[] = [
  profile("20000000-0000-0000-0000-000000000001", "maya-k", "MK", "coral", "Maya K.", "maya.k@example.test", "London, UK", "Technical governance · evaluations · Python", "Research engineering roles", "Prefers mission-focused teams under 80 people."),
  profile("20000000-0000-0000-0000-000000000002", "jon-b", "JB", "blue", "Jon Bell", "jon.b@example.test", "Berlin, DE", "Policy research · biosecurity · writing", "Policy fellowships", "Available from September; open to relocation."),
  profile("20000000-0000-0000-0000-000000000003", "aisha-r", "AR", "mint", "Aisha Rahman", "aisha.r@example.test", "Nairobi, KE", "Operations · grants · community building", "Chief of staff or program roles", "Strong preference for distributed teams."),
  profile("20000000-0000-0000-0000-000000000004", "leo-s", "LS", "amber", "Leo Santos", "leo.s@example.test", "Madrid, ES", "ML engineering · interpretability · Rust", "Applied research roles", "Shared directly after a conference conversation."),
  profile("20000000-0000-0000-0000-000000000005", "nora-v", "NV", "violet", "Nora V.", "nora.v@example.test", "Toronto, CA", "Forecasting · statistics · facilitation", "Short-term research contracts", "Currently balancing part-time study."),
  profile("20000000-0000-0000-0000-000000000006", "sam-t", "ST", "green", "Sam Taylor", "sam.t@example.test", "Boston, US", "Security engineering · threat modeling · Go", "Senior individual-contributor roles", "Does not want current employer contacted."),
  profile("20000000-0000-0000-0000-000000000007", "elena-p", "EP", "pink", "Elena Petrova", "elena.p@example.test", "Prague, CZ", "Program management · multilingual comms", "Operations leadership", "Prefers a four-day week."),
  profile("20000000-0000-0000-0000-000000000008", "dev-c", "DC", "teal", "Dev Chen", "dev.c@example.test", "Singapore", "Data engineering · privacy · TypeScript", "Infrastructure or data roles", "Happy to advise before considering a move."),
];

const [aqueduct, beacon, lattice] = orgs;
const [maya, jon, aisha, leo, nora, sam, elena, dev] = participants;
const grant = (p: Participant, o: Org, attributeKey: Grant["attributeKey"], basis: string): Grant => ({
  participantId: p.id, orgId: o.id, attributeKey, basis,
});

export const grants: Grant[] = [
  grant(maya, aqueduct, "*", "Opted in to all safety orgs"),
  grant(maya, beacon, "*", "Opted in to all safety orgs"),
  grant(maya, lattice, "*", "Opted in to all safety orgs"),
  ...(["name", "location", "skills", "seeking"] as const).map((key) => grant(jon, beacon, key, "Shared non-sensitive profile")),
  ...(["name", "email", "skills", "seeking"] as const).map((key) => grant(aisha, aqueduct, key, "Applied to this org")),
  ...(["name", "location", "skills"] as const).map((key) => grant(leo, lattice, key, "Shared directly with recruiter")),
  grant(leo, lattice, "email", "Shared directly with recruiter"),
  ...(["name", "location", "skills", "seeking"] as const).map((key) => grant(nora, aqueduct, key, "Open call opt-in")),
  ...(["name", "location", "skills", "seeking"] as const).map((key) => grant(nora, beacon, key, "Open call opt-in")),
  ...(["name", "email", "location", "skills", "seeking"] as const).map((key) => grant(sam, aqueduct, key, "Applied to this org")),
  ...(["name", "location", "skills", "seeking"] as const).map((key) => grant(elena, beacon, key, "Public field")),
  ...(["name", "location", "skills", "seeking", "notes"] as const).map((key) => grant(dev, lattice, key, "Shared for infrastructure roles")),
  ...(["name", "skills"] as const).map((key) => grant(dev, aqueduct, key, "Shared directly with recruiter")),
];

const now = Date.now();
export const accessEvents: AccessEvent[] = [
  { id: "1", participantId: maya.id, orgId: aqueduct.id, attributeKey: "email", accessedAt: new Date(now - 2 * 60_000).toISOString() },
  { id: "2", participantId: maya.id, orgId: beacon.id, attributeKey: "skills", accessedAt: new Date(now - 24 * 60_000).toISOString() },
  { id: "3", participantId: maya.id, orgId: aqueduct.id, attributeKey: "notes", accessedAt: new Date(now - 74 * 60_000).toISOString() },
  { id: "4", participantId: maya.id, orgId: lattice.id, attributeKey: "seeking", accessedAt: new Date(now - 26 * 3_600_000).toISOString() },
  { id: "5", participantId: jon.id, orgId: beacon.id, attributeKey: "skills", accessedAt: new Date(now - 8 * 60_000).toISOString() },
  { id: "6", participantId: jon.id, orgId: beacon.id, attributeKey: "location", accessedAt: new Date(now - 3 * 3_600_000).toISOString() },
  { id: "7", participantId: aisha.id, orgId: aqueduct.id, attributeKey: "email", accessedAt: new Date(now - 19 * 60_000).toISOString() },
  { id: "8", participantId: leo.id, orgId: lattice.id, attributeKey: "skills", accessedAt: new Date(now - 49 * 60_000).toISOString() },
  { id: "9", participantId: dev.id, orgId: lattice.id, attributeKey: "notes", accessedAt: new Date(now - 2 * 86_400_000).toISOString() },
];
