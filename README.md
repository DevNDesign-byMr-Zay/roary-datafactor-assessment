# Software Engineering & AI Tooling — Deidentified Assessment Repository

This repository contains the complete deidentified **Software Engineering & AI Tooling** assessment corpus plus a runnable conversational-AI reference service used to exercise the repository's backend engineering patterns.

## Corpus completeness

The mirrored corpus lives under `Software Engineering & AI Tooling/` and spans application bootstrap, reliability and infrastructure, AI model integration, storage and file services, cloud deployment, authentication and security, API foundations, full-stack workflows, backend engineering, and frontend engineering.

`VERIFY_REPORT.md` is generated from a fresh recursive probe of the source Drive folder. The current verification is **1,610 expected / 1,610 present, 0 missing, 0 unexpected**.

## Architecture

The maintained reference service is intentionally layered instead of monolithic:

- `index.mjs` — minimal executable/export entrypoint.
- `src/app.mjs` — Express application factory and HTTP boundary.
- `src/cloud.mjs` — production construction of the Google Gen AI Vertex adapter and direct Firestore server client.
- `src/history-store.mjs` — conversation persistence abstraction.
- `src/model-response.mjs` — defensive provider-response text extraction.
- `src/validation.mjs` — Zod request-boundary validation.
- `src/logger.mjs` — structured Pino logging.
- `src/server.mjs` — process startup and port binding.
- `index.test.mjs` — credential-free Supertest/Jest endpoint tests using injected doubles.
- `tests/` — focused unit, edge-contract, and promoted-corpus specs.

The application factory accepts cloud/database dependencies, so importing or testing the service does **not** require Google Application Default Credentials and does not bind a network port. Production cloud construction uses `@google/genai` for Vertex AI access and `@google-cloud/firestore` directly rather than the broader Firebase Admin dependency tree.

## Maintained and measured surface

The quality surface is deliberately broader than the reference service. In addition to every module under `src/`, three authentic final/canonical corpus artifacts are promoted into the same lint, test, and coverage gates:

- **Authentication & Security** — `Token Authentication Regression/06 FINAL CORRECTED CODE/auth_middleware.mjs`
- **API Foundations** — `Express Gemini Backend Foundation/06 FINAL CORRECTED CODE/cors_policy.mjs`
- **Storage & File Services** — `Signed URL File Access/06 FINAL CORRECTED CODE/sign_route.mjs`

These corpus tests cover authorization success/failure, fail-closed configuration, preflight behavior, CORS allow/deny/error propagation, signed-read URL generation, validation, missing configuration, and signing failures. The historical/versioned corpus remains provenance material and is not bulk-rewritten or falsely labeled as maintained production code.

## Fresh-clone setup

Requirements: Node.js 22+ and npm.

```bash
git clone https://github.com/DevNDesign-byMr-Zay/roary-datafactor-assessment.git
cd roary-datafactor-assessment
npm ci
npm run check
```

`npm run check` lints the maintained service, promoted corpus artifacts, and all test specs, then runs Jest with enforced coverage thresholds. The global coverage floor is 85% for statements/functions/lines and 75% for branches across the measured surface.

For production execution, copy `.env.example` values into your deployment environment and configure Google Application Default Credentials. No credential files belong in this repository.

```bash
npm start
```

Default port: `8080`.

## API

### `GET /health`

Returns service readiness metadata and HTTP 200.

### `POST /chat`

JSON body:

```json
{
  "text": "Hello",
  "sessionId": "example-session"
}
```

`text` is required and bounded; `sessionId` is bounded and defaults to `default`. Invalid payloads return a structured 400 response. Provider or persistence failures return a sanitized 500 without exposing raw exception strings.

## Test strategy

The maintained service is tested at both HTTP and module boundaries. Tests cover health/chat success, invalid and oversized input, strict unknown-field rejection, provider and persistence failures, chronological history reconstruction, write-failure propagation, model-response fallbacks, cloud initialization, Google Gen AI adapter behavior, direct Firestore construction, logger configuration, server startup, 404 handling, and dependency-injection requirements.

Test density is increased by promoting distinct behaviorally meaningful final/canonical artifacts into the same enforcement surface, not by generating shallow tests for every historical snapshot. New promotions should arrive as focused feature/test commits and cover normal behavior, boundaries, configuration, and failures.

## Quality gates

Every push and pull request runs a Drive-independent quality workflow containing:

```bash
npm ci --ignore-scripts
npm audit --audit-level=moderate
npm run lint
npm run test:coverage
```

The same checks run weekly so dependency/security state is re-evaluated against current advisories. Dependabot is configured for npm and GitHub Actions dependencies. Static analysis is also maintained separately through CodeQL. Drive-corpus import and verification workflows remain separate maintenance concerns.

## Privacy and IP scope

The assessment material is deidentified. Product names, original cloud identifiers, user/client references, credentials, private user records, and brand-specific application text are excluded or replaced with neutral assessment-safe equivalents. The repository is intended to preserve engineering signal without publishing secrets or client/customer data.

See `DEIDENTIFICATION_REPORT.md`, `IMPORT_REPORT.md`, and `VERIFY_REPORT.md` for the audit trail.
