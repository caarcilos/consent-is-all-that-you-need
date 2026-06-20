import { grantForKey } from "@/lib/policy";
import { ATTRIBUTE_KEYS, type AttributeKey, type Grant, type Org } from "@/lib/types";
import { titleCase } from "@/lib/format";
import { LockIcon } from "./icons";

type GrantMatrixProps = {
  orgs: Org[];
  participantGrants: Grant[];
  editable?: boolean;
  savingCell?: string | null;
  onToggle?: (org: Org, key: AttributeKey, grant: Grant | undefined) => void;
};

export function GrantMatrix({
  orgs,
  participantGrants,
  editable = false,
  savingCell,
  onToggle,
}: GrantMatrixProps) {
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
                const cellId = `${org.id}:${key}`;
                const content = grant
                  ? <div className="grant-cell"><span>✓ Granted</span><small>{grant.basis}</small>{editable && <b>Click to revoke</b>}</div>
                  : <div className="no-grant"><LockIcon /><span>Not shared</span>{editable && <b>Click to grant</b>}</div>;
                return (
                  <td key={org.id}>
                    {editable
                      ? <button
                          className="grant-toggle"
                          onClick={() => onToggle?.(org, key, grant)}
                          disabled={savingCell === cellId}
                          aria-label={`${grant ? "Revoke" : "Grant"} ${key} for ${org.name}`}
                        >
                          {savingCell === cellId ? <span className="cell-saving">Saving…</span> : content}
                        </button>
                      : content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
