import { readFileSync, statSync } from "node:fs";
import { detect } from "./detect.mjs";
import { hashes } from "./hash.mjs";
import { extractStrings } from "./strings.mjs";
import { listZip, apkSummary } from "./zip.mjs";
import { parseElf } from "./elf.mjs";
import { parsePe } from "./pe.mjs";

// Full inspection report for one file. Pure reading — never executes the target.
export function inspect(path, { stringMin = 4, stringLimit = 40 } = {}) {
  const buf = readFileSync(path);
  const stat = statSync(path);
  const type = detect(buf);
  const report = {
    file: path,
    size: stat.size,
    type: type.kind,
    typeDetail: type.detail,
    hashes: hashes(buf),
  };
  if (type.kind === "elf") report.elf = parseElf(buf);
  if (type.kind === "pe") report.pe = parsePe(buf);
  if (type.kind === "zip" || type.kind === "apk") {
    const entries = listZip(buf);
    report.zipEntries = entries;
    const apk = apkSummary(entries);
    if (apk?.isApk) {
      report.type = "apk";
      report.typeDetail = "Android APK (ZIP)";
      report.apk = apk;
    }
  }
  const strings = extractStrings(buf, stringMin);
  report.stringCount = strings.length;
  report.stringsSample = strings.slice(0, stringLimit);
  report.interestingStrings = strings
    .filter((s) => /https?:\/\/|api[_-]?key|password|token|@|\.com|\.net/i.test(s.text))
    .slice(0, 20)
    .map((s) => s.text);
  return report;
}
