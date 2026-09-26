# Contributing

This assessment repository is maintained as a sequence of small, reviewable engineering increments.

## Development workflow

1. Create a focused branch for one feature, fix, test, or documentation change.
2. Install dependencies from the committed lockfile with `npm ci`.
3. Keep runtime changes layered under `src/`; avoid mixing unrelated formatting or corpus changes into feature commits.
4. Add or update tests in the same change that introduces new behavior.
5. Run `npm run lint` and `npm test` before pushing.
6. Use descriptive conventional-style commit messages such as `feat: validate chat payloads` or `fix: sanitize provider errors`.

## Historical provenance

The released historical corpus is preserved at `archive/historical-corpus-v1.1.2` and is intentionally absent from the scored application tree. Do not repopulate application `main` with the complete archive.

When promoting historically sourced behavior, place the maintained copy under `src/`, preserve its original archive path and content identity in provenance metadata, add behavior-focused tests, and keep `npm run verify:surface` plus `npm run verify:integrity` green.

## Security and privacy

Never commit credentials, API keys, access tokens, private user records, production identifiers, or client/customer PII. Use `.env.example` only for non-secret variable names and placeholders.
