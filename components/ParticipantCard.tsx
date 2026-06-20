import { titleCase } from "@/lib/format";
import type { VisibleProfile } from "@/lib/visibleProfile";
import { LockedField } from "./LockedField";

export function ParticipantCard({ profile }: { profile: VisibleProfile }) {
  const name = profile.attributes.find((item) => item.key === "name");
  const visibleCount = profile.attributes.filter((item) => item.visible).length;
  return (
    <article className="participant-card">
      <div className="card-heading">
        <div className={`avatar ${profile.tone}`}>{profile.initials}</div>
        <div>
          <h2>{name?.visible ? name.value : profile.handle}</h2>
          <p>@{profile.handle}</p>
        </div>
        <span className="visibility-count">{visibleCount}/6 fields visible</span>
      </div>
      <div className="attribute-list">
        {profile.attributes.map((attribute) => (
          <div className={`attribute-row ${attribute.visible ? "" : "is-locked"}`} key={attribute.key}>
            <span className="attribute-label">{titleCase(attribute.key)}{attribute.sensitivity === "sensitive" && <i>Sensitive</i>}</span>
            {attribute.visible ? <span className="attribute-value">{attribute.value}</span> : <LockedField />}
          </div>
        ))}
      </div>
    </article>
  );
}
