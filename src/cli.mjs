import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { inspect } from "./inspect.mjs";
import { extractStrings } from "./strings.mjs";
import { hashes } from "./hash.mjs";

const VERSION = "0.1.0";

const HELP = `mini-rea ${VERSION} — a tiny reverse-engineering helper (local only, never executes the target)

Usage:
  mini-rea inspect <file> [--json]     Full report: type, hashes, headers, ZIP/APK listing, strings
  mini-rea strings <file> [--min N]    Printable strings with file offsets
  mini-rea hash <file>                  MD5 / SHA-1 / SHA-256
  mini-rea doctor                       Check the environment (node, optional tools)
  mini-rea --help | --version

Examples:
  mini-rea inspect app.apk
  mini-rea inspect program.exe --json
  mini-rea strings firmware.bin --min 6
`;

function fail(msg) {
  console.error(`mini-rea: ${msg}`);
  process.exit(1);
}

function needFile(args) {
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) fail("no file given. See `mini-rea --help`.");
  if (!existsSync(file)) fail(`file not found: ${file}`);
  return file;
}

function printJson(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

function printInspect(r) {
  console.log(`File:      ${r.file}`);
  console.log(`Size:      ${r.size} bytes`);
  console.log(`Type:      ${r.type} — ${r.typeDetail}`);
  console.log(`SHA-256:   ${r.hashes.sha256}`);
  console.log(`SHA-1:     ${r.hashes.sha1}`);
  console.log(`MD5:       ${r.hashes.md5}`);
  if (r.elf) {
    console.log(`ELF:       ${r.elf.class}, ${r.elf.data}, ${r.elf.type}, ${r.elf.machine}, entry ${r.elf.entry}`);
  }
  if (r.pe) {
    console.log(`PE:        ${r.pe.machine}, ${r.pe.sections} sections, DLL: ${r.pe.isDll ? "yes" : "no"}, subsystem: ${r.pe.subsystem ?? "?"}`);
  }
  if (r.apk) {
    console.log(`APK:       manifest: ${r.apk.manifest ? "yes" : "no"}, DEX: ${r.apk.dexFiles.join(", ") || "none"}, native libs: ${r.apk.nativeLibs}, assets: ${r.apk.assets}, res: ${r.apk.resCount}`);
    if (r.apk.signatureFiles.length) console.log(`Signatures: ${r.apk.signatureFiles.join(", ")}`);
  } else if (r.zipEntries) {
    console.log(`ZIP:       ${r.zipEntries.length} entries`);
    for (const e of r.zipEntries.slice(0, 15)) console.log(`  - ${e.name} (${e.size} bytes)`);
    if (r.zipEntries.length > 15) console.log(`  ... and ${r.zipEntries.length - 15} more`);
  }
  console.log(`Strings:   ${r.stringCount} (min length 4)`);
  if (r.interestingStrings.length) {
    console.log("Interesting strings:");
    for (const s of r.interestingStrings) console.log(`  - ${s}`);
  }
}

export function main(argv) {
  const [cmd, ...rest] = argv;
  const json = rest.includes("--json");
  if (!cmd || cmd === "--help" || cmd === "-h") { console.log(HELP); return; }
  if (cmd === "--version" || cmd === "-v") { console.log(VERSION); return; }

  if (cmd === "doctor") {
    console.log(`Node: ${process.version} (${process.platform}/${process.arch})`);
    for (const tool of ["java", "jadx", "apktool", "adb", "ghidra"]) {
      try {
        execSync(`command -v ${tool}`, { stdio: "ignore" });
        console.log(`  ${tool}: found`);
      } catch {
        console.log(`  ${tool}: not found (optional)`);
      }
    }
    return;
  }

  if (cmd === "inspect") {
    const file = needFile(rest);
    const report = inspect(file);
    if (json) printJson(report); else printInspect(report);
    return;
  }

  if (cmd === "strings") {
    const file = needFile(rest);
    const minArg = rest.indexOf("--min");
    const min = minArg >= 0 ? parseInt(rest[minArg + 1], 10) || 4 : 4;
    const list = extractStrings(readFileSync(file), min);
    if (json) printJson(list);
    else for (const s of list) console.log(`0x${s.offset.toString(16).padStart(8, "0")}  ${s.text}`);
    return;
  }

  if (cmd === "hash") {
    const file = needFile(rest);
    const h = hashes(readFileSync(file));
    if (json) printJson(h);
    else console.log(`MD5:     ${h.md5}\nSHA-1:   ${h.sha1}\nSHA-256: ${h.sha256}`);
    return;
  }

  fail(`unknown command: ${cmd}. See \`mini-rea --help\`.`);
}
