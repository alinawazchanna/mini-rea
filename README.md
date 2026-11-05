# mini-rea

**A tiny reverse-engineering helper. Inspect a file, see how it works — down to the bytes.**

`mini-rea` is a small, zero-dependency Node.js CLI inspired by [REA](https://github.com/morluto/rea)
(Reverse Engineer Anything). It reads a file and reports what it finds — never executing it.

## What it can inspect

| Target | What you get |
| ------ | ------------ |
| Any file | Size, MD5 / SHA-1 / SHA-256, printable strings |
| ELF binaries | Class, endianness, type, machine, entry point |
| PE executables (.exe/.dll) | Machine, section count, DLL flag, subsystem |
| ZIP / APK / JAR | Entry listing; for APKs: manifest, DEX files, native libs, assets, signatures |
| Text files | Detected as plain text |

## Quick start

Requires Node.js 18+.

```bash
npm install --global mini-rea
mini-rea doctor
mini-rea inspect app.apk
```

Or run without installing:

```bash
git clone <your-repo-url> mini-rea
cd mini-rea
node bin/mini-rea inspect app.apk
```

## Commands

```bash
mini-rea inspect <file> [--json]   Full report
mini-rea strings <file> [--min N]  Printable strings with file offsets
mini-rea hash <file>                MD5 / SHA-1 / SHA-256
mini-rea doctor                     Environment check (node, optional tools)
```

## Example

```text
$ mini-rea inspect app.apk
File:      app.apk
Size:      25868 bytes
Type:      apk — Android APK (ZIP)
SHA-256:   9f2c...
APK:       manifest: yes, DEX: classes.dex, native libs: 0, assets: 0, res: 12
Strings:   412 (min length 4)
```

## How it works

Everything is local and read-only:

- File type is detected from magic bytes, not the extension.
- ZIP/APK entries are read from the central directory — no extraction.
- ELF/PE headers are parsed directly; strings are printable-byte runs.
- The target is **never executed**.

## Limitations

This is a *tiny* tool on purpose. It does not decompile code, decode
`AndroidManifest.xml`, or replace a full analysis engine (jadx, Ghidra,
Hopper). When you need that depth, use [REA](https://github.com/morluto/rea).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep it small: every new feature must
justify its bytes.

## License

[MIT](LICENSE) — Ali Nawaz Channa.
