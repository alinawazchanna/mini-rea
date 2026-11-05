// Extract printable ASCII/UTF-8 strings with file offsets.
export function extractStrings(buf, minLen = 4) {
  const out = [];
  let start = -1;
  const isPrint = (b) => b >= 0x20 && b <= 0x7e;
  for (let i = 0; i <= buf.length; i++) {
    const printable = i < buf.length && isPrint(buf[i]);
    if (printable && start === -1) start = i;
    if (!printable && start !== -1) {
      if (i - start >= minLen) {
        out.push({ offset: start, text: buf.toString("latin1", start, i) });
      }
      start = -1;
    }
  }
  return out;
}
