// Minimal ELF header parser.
const MACHINE = {
  0x03: "x86", 0x3e: "x86-64", 0x28: "ARM", 0xb7: "AArch64",
  0x08: "MIPS", 0xf3: "RISC-V", 0x32: "IA-64",
};
const TYPE = { 1: "relocatable", 2: "executable", 3: "shared object", 4: "core" };

export function parseElf(buf) {
  if (buf.length < 64 || buf[0] !== 0x7f || buf.toString("latin1", 1, 4) !== "ELF") return null;
  const is64 = buf[4] === 2;
  const le = buf[5] !== 2;
  const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const u64 = (o) => Number(le ? buf.readBigUInt64LE(o) : buf.readBigUInt64BE(o));
  return {
    class: is64 ? "ELF64" : "ELF32",
    data: le ? "little-endian" : "big-endian",
    type: TYPE[u16(16)] ?? `unknown (${u16(16)})`,
    machine: MACHINE[u16(18)] ?? `unknown (0x${u16(18).toString(16)})`,
    entry: "0x" + (is64 ? u64(24) : u32(24)).toString(16),
  };
}
