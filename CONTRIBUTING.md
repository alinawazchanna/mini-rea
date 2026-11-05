# Contributing to mini-rea

Small, focused contributions only — this tool stays tiny on purpose.

- **Bug fixes:** include the smallest reproduction (file type + command) and
  the observed vs expected output.
- **New formats:** add a detector in `src/detect.mjs`, a parser in its own
  module, and a test with a real fixture. Keep it dependency-free.
- **No scope creep:** if a feature needs a native engine (decompiler,
  disassembler), it belongs in a bigger tool like
  [REA](https://github.com/morluto/rea), not here.

Run `npm test` before sending a change. Keep the README accurate.
