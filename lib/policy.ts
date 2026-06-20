import { ATTRIBUTE_KEYS, type AttributeKey, type Grant } from "./types";

// Presentational mirror only. PostgreSQL RLS is the actual security boundary.
export function grantedKeys(grants: Grant[]): Set<AttributeKey> {
  if (grants.some((grant) => grant.attributeKey === "*")) {
    return new Set(ATTRIBUTE_KEYS);
  }
  return new Set(grants.map((grant) => grant.attributeKey).filter((key): key is AttributeKey => key !== "*"));
}

export function grantForKey(grants: Grant[], key: AttributeKey): Grant | undefined {
  return grants.find((grant) => grant.attributeKey === key)
    ?? grants.find((grant) => grant.attributeKey === "*");
}
