# Historical Corpus Boundary

## Purpose

The repository contains two deliberately different surfaces:

1. **Maintained software** — the runnable service under `src/`, the root entrypoint, tests, maintenance scripts, and explicitly promoted corpus artifacts.
2. **Historical/versioned provenance** — the complete mirrored corpus under `Software Engineering & AI Tooling/`.

The historical corpus is preserved because revision history, alternative implementations, corrected versions, and workflow context are part of the repository's evidence. It is not implicitly treated as one production application and must not be bulk-rewritten merely to satisfy current lint, formatting, or coverage rules.

## Measured maintained surface

The default lint and coverage gates include all maintained `src/**/*.mjs` code plus these three explicitly promoted final/canonical corpus artifacts:

- `Software Engineering & AI Tooling/Authentication & Security/Token Authentication Regression/06 FINAL CORRECTED CODE/auth_middleware.mjs`
- `Software Engineering & AI Tooling/API Foundations/Express Gemini Backend Foundation/06 FINAL CORRECTED CODE/cors_policy.mjs`
- `Software Engineering & AI Tooling/Storage & File Services/Signed URL File Access/06 FINAL CORRECTED CODE/sign_route.mjs`

These promotions are intentional because each artifact is exercised by focused tests and contributes distinct maintained behavior.

## Repository statistics boundary

`.gitattributes` marks the historical corpus root as `linguist-detectable=false` so repository language statistics do not treat preserved revision snapshots as the active application. The three explicitly promoted artifacts are then re-enabled with exact-path `linguist-detectable=true` overrides.

This metadata changes classification only. It does **not** delete, ignore, rewrite, or exclude historical files from Git, Drive verification, provenance audits, archive packaging, or buyer-facing corpus completeness checks.

The blocking `npm run verify:surface` gate verifies that the statistics rule still matches `config/repository-surfaces.json` and that every promoted artifact has an explicit override.

## Promotion rule

A historical artifact may enter the maintained quality surface only through a focused change that:

- identifies the exact source path being promoted;
- adds or updates behavior-focused tests;
- includes the exact path in lint/coverage configuration rather than a broad historical-corpus glob;
- preserves the original provenance unless a separately justified source correction is required; and
- passes the normal pull-request CI and security analysis on the exact proposed head.

Do not add a wildcard such as `Software Engineering & AI Tooling/**` to maintained lint or coverage configuration. That would collapse the distinction between preserved revision history and actively maintained software, distort test-density signals, and make routine maintenance rewrite provenance.

## Corpus maintenance

Drive mirror/import tooling is a separate provenance-maintenance concern. A refresh must remain transactional: a partial or blocked remote download must not replace the currently verified corpus. Corpus and verification-report changes are reviewed through pull requests rather than written directly to `main`.

See `README.md`, `CONTRIBUTING.md`, `IMPORT_REPORT.md`, and `VERIFY_REPORT.md` for the adjacent onboarding and provenance contracts.
