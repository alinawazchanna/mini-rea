// Magic-byte file type detection. Returns { kind, detail }.
// kind is one of: elf, pe, zip, apk, dex, macho, pdf, png, jpeg, java-class, text, unknown.
export function detect(buf) {
  const head = (n) => buf.subarray(0, n);
  const ascii = (off, len) => buf.toString("latin1", off, off + len);
  if (buf.length >= 4 && buf[0] === 0x7f && ascii(1, 3) === "ELF") {
    const bits = buf[4] === 2 ? "64-bit" : buf[4] === 1 ? "32-bit" : "unknown class";
    const endian = buf[5] === 2 ? "big-endian" : "little-endian";
    return { kind: "elf", detail: `${bits}, ${endian}` };
  }
  if (buf.length >= 2 && ascii(0, 2) === "MZ") return { kind: "pe", detail: "DOS/PE executable" };
  if (buf.length >= 4 && ascii(0, 4) === "PK\x03\x04") return { kind: "zip", detail: "ZIP archive" };
  if (buf.length >= 4 && ascii(0, 4) === "dex\n") return { kind: "dex", detail: "Dalvik DEX" };
  if (buf.length >= 4 && [0xfe, 0xed, 0xfa, 0xce, 0xcf, 0xfa, 0xed, 0xfe].includes(buf[0])) {
    return { kind: "macho", detail: "Mach-O binary" };
  }
  if (buf.length >= 5 && ascii(0, 5) === "%PDF-") return { kind: "pdf", detail: "PDF document" };
  if (buf.length >= 8 && buf[0] === 0x89 && ascii(1, 3) === "PNG") return { kind: "png", detail: "PNG image" };
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { kind: "jpeg", detail: "JPEG image" };
  }
  if (buf.length >= 4 && buf[0] === 0xca && buf[1] === 0xfe && buf[2] === 0xba && buf[3] === 0xbe) {
    return { kind: "java-class", detail: "Java class file" };
  }
  // Heuristic: mostly printable text.
  let printable = 0;
  const sample = buf.subarray(0, Math.min(buf.length, 8192));
  for (const b of sample) if ((b >= 0x09 && b <= 0x0d) || (b >= 0x20 && b <= 0x7e)) printable++;
  if (sample.length > 0 && printable / sample.length > 0.95) {
    return { kind: "text", detail: "plain text" };
  }
  return { kind: "unknown", detail: "unrecognized format" };
}
