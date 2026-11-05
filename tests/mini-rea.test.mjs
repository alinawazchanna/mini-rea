import test from "node:test";
import assert from "node:assert/strict";
import { detect } from "../src/detect.mjs";
import { extractStrings } from "../src/strings.mjs";
import { hashes } from "../src/hash.mjs";
import { listZip } from "../src/zip.mjs";
import { parseElf } from "../src/elf.mjs";
import { parsePe } from "../src/pe.mjs";

test("detect: ELF 64-bit little-endian", () => {
  const buf = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00]);
  assert.equal(detect(buf).kind, "elf");
  assert.match(detect(buf).detail, /64-bit/);
});

test("detect: PE from MZ header", () => {
  assert.equal(detect(Buffer.from("MZ" + "\0".repeat(62))).kind, "pe");
});

test("detect: ZIP from PK header", () => {
  assert.equal(detect(Buffer.from("PK\x03\x04" + "\0".repeat(20))).kind, "zip");
});

test("detect: plain text", () => {
  assert.equal(detect(Buffer.from("hello world, this is text\n")).kind, "text");
});

test("detect: unknown binary", () => {
  assert.equal(detect(Buffer.from([0x00, 0x01, 0x02, 0x03, 0x00, 0x01])).kind, "unknown");
});

test("strings: finds runs with offsets", () => {
  const buf = Buffer.concat([Buffer.from([0x00, 0x01]), Buffer.from("hello"), Buffer.from([0x00]), Buffer.from("hi")]);
  const found = extractStrings(buf, 4);
  assert.equal(found.length, 1);
  assert.equal(found[0].text, "hello");
  assert.equal(found[0].offset, 2);
});

test("hashes: known SHA-256 of empty input", () => {
  const h = hashes(Buffer.alloc(0));
  assert.equal(h.sha256, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
});

test("zip: non-ZIP returns null", () => {
  assert.equal(listZip(Buffer.from("not a zip at all")), null);
});

test("elf: short buffer returns null", () => {
  assert.equal(parseElf(Buffer.from([0x7f, 0x45, 0x4c, 0x46])), null);
});

test("pe: short buffer returns null", () => {
  assert.equal(parsePe(Buffer.from("MZ")), null);
});
