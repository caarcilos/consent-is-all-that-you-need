export const ATTRIBUTE_KEYS = [
  "name",
  "email",
  "location",
  "skills",
  "seeking",
  "notes",
] as const;

export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];
export type Org = { id: string; slug: string; name: string; short: string };
export type Attribute = {
  key: AttributeKey;
  value: string;
  sensitivity: "standard" | "sensitive";
};
export type Participant = {
  id: string;
  handle: string;
  initials: string;
  tone: string;
  attributes: Attribute[];
};
export type Grant = {
  participantId: string;
  orgId: string;
  attributeKey: AttributeKey | "*";
  basis: string;
};
export type AccessEvent = {
  id: string;
  participantId: string;
  orgId: string;
  attributeKey: AttributeKey;
  accessedAt: string;
};
