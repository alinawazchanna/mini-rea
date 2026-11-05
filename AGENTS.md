# Repository Guidelines

mini-rea is a tiny, local-only inspection tool. Keep it tiny.

## Rules

- Zero runtime dependencies. Node.js standard library only.
- Never execute the target file. Reading bytes is the whole job.
- Distinguish observations (what the bytes say) from inferences (what they
  probably mean). Never claim a measurement you did not perform.
- Every command must work with `--json` for scripting.
- Keep the CLI fast and the output small: summaries first, details on request.

## Development

- `node bin/mini-rea --help` — smoke test.
- `npm test` — runs the test suite in `tests/`.
- Use plain ESM (`.mjs`), no build step.

## Contributing

Small, focused changes only. A new file format needs a detector in
`src/detect.mjs`, a parser in its own module, and a test with a real fixture.
