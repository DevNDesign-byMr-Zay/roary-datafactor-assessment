# Changelog

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
