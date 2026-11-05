// Minimal PE (Windows) header parser.
const MACHINE = {
  0x014c: "i386", 0x8664: "x86-64", 0x01c0: "ARM", 0xaa64: "ARM64",
  0x01c4: "ARMv7", 0x0200: "IA-64",
};

export function parsePe(buf) {
  if (buf.length < 64 || buf.toString("latin1", 0, 2) !== "MZ") return null;
  const peOff = buf.readUInt32LE(0x3c);
  if (peOff + 24 > buf.length || buf.toString("latin1", peOff, peOff + 4) !== "PE\0\0") return null;
  const coff = peOff + 4;
  const machine = buf.readUInt16LE(coff);
  const sections = buf.readUInt16LE(coff + 2);
  const characteristics = buf.readUInt16LE(coff + 18);
  const optSize = buf.readUInt16LE(coff + 16);
  const opt = coff + 20;
  let subsystem = null;
  if (optSize >= 68 && opt + 68 <= buf.length) {
    const subs = { 1: "native", 2: "GUI", 3: "console", 9: "Windows CE GUI" };
    subsystem = subs[buf.readUInt16LE(opt + 68)] ?? `unknown (${buf.readUInt16LE(opt + 68)})`;
  }
  return {
    machine: MACHINE[machine] ?? `unknown (0x${machine.toString(16)})`,
    sections,
    isDll: (characteristics & 0x2000) !== 0,
    isExecutable: (characteristics & 0x0002) !== 0,
    subsystem,
  };
}
