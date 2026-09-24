# Changelog

## Unreleased — maintained service hardening

### Added

- Renewable workload policy, decision trace, policy comparison, and workload-decision summary surfaces that remain advisory and evidence-oriented rather than deployment authority.
- Explicit maintained-vs-historical surface verification and a release-readiness verifier covering semantic package metadata, exact corpus integrity, reproducible CI, container startup, and CodeQL.
- Broader maintained JavaScript type-check coverage across renewable-policy and workload-decision service modules.
- Deterministic renewable-evidence demo coverage for the current maintained service path.

### Changed

- Refreshed the current Node dependency set and verified the resulting lockfile through assessment CI and CodeQL.
- Strengthened the maintained service boundary so release and scoring workflows operate on the current runtime surface without reclassifying preserved historical corpus files.

### Release policy

- Current package candidate: `1.1.0`. No hosted tag or release is claimed until the gated manual release workflow publishes it.
- This section records current repository work only; no hosted release or tag is claimed until one is actually published.

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
