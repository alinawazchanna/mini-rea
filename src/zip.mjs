// Minimal ZIP central-directory reader (covers APK/JAR/ZIP).
// Returns [{ name, size, compressedSize }] or null if not a ZIP.
export function listZip(buf) {
  if (buf.length < 22 || buf.toString("latin1", 0, 4) !== "PK\x03\x04") return null;
  // Find End Of Central Directory record by scanning the tail.
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd === -1) return null;
  const total = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  const entries = [];
  for (let n = 0; n < total; n++) {
    if (off + 46 > buf.length || buf.readUInt32LE(off) !== 0x02014b50) break;
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    const name = buf.toString("utf8", off + 46, off + 46 + nameLen);
    entries.push({
      name,
      size: buf.readUInt32LE(off + 24),
      compressedSize: buf.readUInt32LE(off + 20),
    });
    off += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

// APK-specific summary on top of the ZIP listing.
export function apkSummary(entries) {
  if (!entries) return null;
  const has = (name) => entries.some((e) => e.name === name);
  return {
    isApk: has("AndroidManifest.xml"),
    manifest: has("AndroidManifest.xml"),
    dexFiles: entries.filter((e) => e.name.endsWith(".dex")).map((e) => e.name),
    nativeLibs: entries.filter((e) => e.name.startsWith("lib/") && e.name.endsWith(".so")).length,
    assets: entries.filter((e) => e.name.startsWith("assets/")).length,
    resCount: entries.filter((e) => e.name.startsWith("res/")).length,
    signatureFiles: entries.filter((e) => e.name.startsWith("META-INF/")).map((e) => e.name),
  };
}
