import { relativeTime, titleCase } from "@/lib/format";
import type { AccessEvent, AttributeKey, Org } from "@/lib/types";
import { EyeIcon } from "./icons";

type GroupedAccess = {
  orgId: string;
  latestAccessedAt: string;
  fields: AttributeKey[];
};

function groupEventsByOrg(events: AccessEvent[]): GroupedAccess[] {
  const grouped = new Map<string, GroupedAccess>();

  for (const event of events) {
    const existing = grouped.get(event.orgId);
    if (!existing) {
      grouped.set(event.orgId, {
        orgId: event.orgId,
        latestAccessedAt: event.accessedAt,
        fields: [event.attributeKey],
      });
      continue;
    }

    if (!existing.fields.includes(event.attributeKey)) {
      existing.fields.push(event.attributeKey);
    }
    if (event.accessedAt > existing.latestAccessedAt) {
      existing.latestAccessedAt = event.accessedAt;
    }
  }

  return Array.from(grouped.values()).sort((a, b) =>
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
  const groupedEvents = groupEventsByOrg(events);

  return (
    <div className="access-feed">
      {groupedEvents.map((event) => {
        const org = orgs.find((item) => item.id === event.orgId);
        return (
          <div className="access-event" key={event.orgId}>
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
