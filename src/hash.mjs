import { createHash } from "node:crypto";

export function hashes(buf) {
  const out = {};
  for (const algo of ["md5", "sha1", "sha256"]) {
    out[algo] = createHash(algo).update(buf).digest("hex");
  }
  return out;
}
