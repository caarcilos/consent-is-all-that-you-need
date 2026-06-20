import { relativeTime, titleCase } from "@/lib/format";
import { orgs } from "@/lib/syntheticData";
import type { AccessEvent } from "@/lib/types";
import { EyeIcon } from "./icons";

export function AccessLogFeed({ events }: { events: AccessEvent[] }) {
  return (
    <div className="access-feed">
      {events.map((event) => {
        const org = orgs.find((item) => item.id === event.orgId)!;
        return <div className="access-event" key={event.id}><div className="event-icon"><EyeIcon /></div><div><p><strong>{org.name}</strong> viewed your <em>{titleCase(event.attributeKey)}</em></p><span>{relativeTime(event.accessedAt)}</span></div></div>;
      })}
      {!events.length && <div className="empty-log">No reads have been logged for this participant.</div>}
    </div>
  );
}
