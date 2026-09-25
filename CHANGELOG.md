# Changelog

## Unreleased

### Changed

- Externalized the complete 1,610-file historical corpus from the future scored application tree while preserving the exact released tree at `archive/historical-corpus-v1.1.2` and recording every released path/blob/size identity under `provenance/`.
- Promoted the three actively tested historical artifacts into byte-identical maintained copies under `src/promoted/`, with original archive paths and hashes retained in integrity metadata.
 — pre-rescore detector hardening

### Added

- Pinned TypeScript 5.9.3 as a local development dependency with a synchronized npm lockfile and release-readiness enforcement.
- Explicit credential-free `npm test` execution in CI so the runnable suite is visible to conventional repository scanners.

### Changed

- Current package candidate: `1.1.2`. The `v1.1.1` release is the latest hosted milestone; this candidate is not published until the gated manual release workflow publishes it.

## 1.1.1 — 2026-09-24 — post-release hardening

### Added

- Canonical root `docker-compose.yml` discovery backed by CI validation and fresh-clone environment contract tests.
- Credential-free Jest coverage execution with the generated coverage report retained as a 30-day workflow artifact.
- Conventional health metadata including service status, package-aligned version, and uptime without sharing the request-deadline clock.

### Changed

- CI-only release metadata names are documented in `.env.example` and enforced by release-readiness verification.
- Published as `v1.1.1` on 2026-09-24 through the gated manual release workflow.

## 1.1.0 — 2026-09-24 — maintained service hardening

### Added

- Renewable workload policy, decision trace, policy comparison, and workload-decision summary surfaces that remain advisory and evidence-oriented rather than deployment authority.
- Explicit maintained-vs-historical surface verification and a release-readiness verifier covering semantic package metadata, exact corpus integrity, reproducible CI, container startup, and CodeQL.
- Broader maintained JavaScript type-check coverage across renewable-policy and workload-decision service modules.
- Deterministic renewable-evidence demo coverage for the current maintained service path.
- Reference-only environment placeholders for names found in preserved historical examples, without widening the maintained runtime configuration contract.

### Changed

- Release readiness now requires the security policy, contribution guide, review ownership, and pull-request validation template.
- Gated releases now attach a CycloneDX dependency SBOM, exact commit evidence, and SHA-256 checksums as release artifacts.
- Release evidence now includes a machine-readable manifest binding the requested tag, package version, and exact commit SHA.
- Manual release evidence is checksum-verified and retained as a workflow artifact before GitHub publication so failed publication does not discard the verified bundle.
- Refreshed the current Node dependency set and verified the resulting lockfile through assessment CI and CodeQL.
- Audited dependency baseline on 2026-09-24: `@google-cloud/firestore@^9.2.0`, `@google/genai@^2.23.0`, `cors@^2.8.5`, `express@^5.2.1`, `pino@^10.3.1`, and `zod@^4.6.5`; the blocking CI audit passed at moderate severity, with weekly npm and GitHub Actions updates enforced through Dependabot.
- Strengthened the maintained service boundary so release and scoring workflows operate on the current runtime surface without reclassifying preserved historical corpus files.

### Release policy

- Published as `v1.1.0` on 2026-09-24 through the gated manual release workflow.
- This section records the verified 1.1.0 milestone and its release evidence.

## 1.0.0 — 2026-09-02

### Added

- Complete deidentified Software Engineering & AI Tooling corpus mirrored from Drive.
- Exact live Drive-to-GitHub corpus verification.
- Layered Express application architecture with injectable cloud dependencies.
- Zod request validation and bounded input handling.
- Structured Pino logging and sanitized HTTP error responses.
- Jest/Supertest endpoint tests that run without Google Cloud credentials.
- ESLint enforcement, npm security audit, reproducible `npm ci`, and real CI quality gates.
- Weekly Dependabot updates for npm and GitHub Actions.
- Reproducible Docker runtime.
- Contribution and architecture documentation.

### Changed

- Replaced the original single-file assessment service with separate application, cloud, persistence, validation, logging, response-parsing, and startup modules.
- Replaced the previous backend-only assessment description with documentation of the complete engineering corpus.

### Fixed

- Restored all Drive corpus files omitted from the original assessment repository.
- Recovered three transient Drive-download failures and verified zero missing or unexpected corpus files.
