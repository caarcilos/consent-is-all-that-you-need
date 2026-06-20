import { grantedKeys } from "./policy";
import type { Attribute, Grant, Participant } from "./types";

export type VisibleAttribute = Attribute & { visible: boolean };
export type VisibleProfile = Omit<Participant, "attributes"> & { attributes: VisibleAttribute[] };

// Shapes the already-authorized response for the UI. It must never be used as the gate.
export function visibleProfile(participant: Participant, grants: Grant[]): VisibleProfile {
  const visible = grantedKeys(grants);
  return {
    ...participant,
    attributes: participant.attributes.map((attribute) => ({
      ...attribute,
      value: visible.has(attribute.key) ? attribute.value : "",
      visible: visible.has(attribute.key),
    })),
  };
}
