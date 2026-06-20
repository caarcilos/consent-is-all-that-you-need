import { grantForKey } from "@/lib/policy";
import { orgs } from "@/lib/syntheticData";
import { ATTRIBUTE_KEYS, type Grant } from "@/lib/types";
import { titleCase } from "@/lib/format";
import { LockIcon } from "./icons";

export function GrantMatrix({ participantGrants }: { participantGrants: Grant[] }) {
  return (
    <div className="matrix-wrap">
      <table className="grant-matrix">
        <thead><tr><th>Profile field</th>{orgs.map((org) => <th key={org.id}><span className="mini-org">{org.short}</span>{org.name}</th>)}</tr></thead>
        <tbody>
          {ATTRIBUTE_KEYS.map((key) => (
            <tr key={key}>
              <th>{titleCase(key)}{(key === "email" || key === "notes") && <span className="sensitive-dot" title="Sensitive field" />}</th>
              {orgs.map((org) => {
                const grant = grantForKey(participantGrants.filter((item) => item.orgId === org.id), key);
                return <td key={org.id}>{grant ? <div className="grant-cell"><span>✓ Granted</span><small>{grant.basis}</small></div> : <div className="no-grant"><LockIcon /><span>Not shared</span></div>}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
