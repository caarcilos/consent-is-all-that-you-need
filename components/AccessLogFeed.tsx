import { relativeTime, titleCase } from "@/lib/format";
import {
  ATTRIBUTE_KEYS,
  type AccessEvent,
  type AttributeKey,
  type Org,
} from "@/lib/types";
import { EyeIcon } from "./icons";

type GroupedAccess = {
  orgId: string;
  latestAccessedAt: string;
  fields: AttributeKey[];
};

function sortFields(fields: AttributeKey[]) {
  return [...fields].sort(
    (left, right) => ATTRIBUTE_KEYS.indexOf(left) - ATTRIBUTE_KEYS.indexOf(right),
  );
}

function groupEventsByPermissionTuple(events: AccessEvent[]): GroupedAccess[] {
  // All attribute rows written by one search RPC share the same PostgreSQL
  // transaction timestamp. Reconstruct that read first, then collapse repeated
  // reads only when both the organization and exact field tuple are unchanged.
  const reads = new Map<string, GroupedAccess>();

  for (const event of events) {
    const readKey = `${event.orgId}:${event.accessedAt}`;
    const existing = reads.get(readKey);
    if (!existing) {
      reads.set(readKey, {
        orgId: event.orgId,
        latestAccessedAt: event.accessedAt,
        fields: [event.attributeKey],
      });
      continue;
    }

    if (!existing.fields.includes(event.attributeKey)) {
      existing.fields.push(event.attributeKey);
    }
  }

  const tuples = new Map<string, GroupedAccess>();
  for (const read of reads.values()) {
    const fields = sortFields(read.fields);
    const tupleKey = `${read.orgId}:${fields.join(",")}`;
    const existing = tuples.get(tupleKey);
    if (!existing || read.latestAccessedAt > existing.latestAccessedAt) {
      tuples.set(tupleKey, { ...read, fields });
    }
  }

  return Array.from(tuples.values()).sort((a, b) =>
    b.latestAccessedAt.localeCompare(a.latestAccessedAt),
  );
}

export function AccessLogFeed({
  events,
  orgs,
}: {
  events: AccessEvent[];
  orgs: Org[];
}) {
  const groupedEvents = groupEventsByPermissionTuple(events);

  return (
    <div className="access-feed">
      {groupedEvents.map((event) => {
        const org = orgs.find((item) => item.id === event.orgId);
        return (
          <div
            className="access-event"
            key={`${event.orgId}:${event.fields.join(",")}`}
          >
            <div className="event-icon">
              <EyeIcon />
            </div>
            <div className="event-copy">
              <p>
                <strong>{org?.name ?? "Unknown organization"}</strong> viewed
                your profile
              </p>
              <div className="viewed-fields">
                {event.fields.map((field) => (
                  <em key={field}>{titleCase(field)}</em>
                ))}
              </div>
              <span>{relativeTime(event.latestAccessedAt)}</span>
            </div>
          </div>
        );
      })}
      {!groupedEvents.length && (
        <div className="empty-log">
          No reads yet (explore the organization lens to generate some)
        </div>
      )}
    </div>
  );
}
