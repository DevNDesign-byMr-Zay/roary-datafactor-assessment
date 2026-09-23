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

These corpus tests cover authorization success/failure, fail-closed configuration, preflight behavior, CORS allow/deny/error propagation, signed-read URL generation, validation, missing configuration, and signing failures. The historical/versioned corpus remains provenance material and is not bulk-rewritten or falsely labeled as maintained production code. `ARCHIVE.md` defines and regression-protects this boundary, including the exact promoted corpus paths that participate in maintained lint and coverage.


### Machine-readable repository surfaces

`config/repository-surfaces.json` declares the active runtime/test roots separately from the preserved historical corpus and lists only the exact historical artifacts intentionally promoted into blocking quality gates. `npm run verify:surface` validates that split in CI, while `npm run typecheck` applies a staged JavaScript type-check gate to maintained runtime modules without treating the historical archive as homogeneous production code.

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

### Container startup

The existing Dockerfile and Compose definition provide a one-command startup path from a fresh checkout:

```bash
docker compose up --build
```

The service is available at `http://127.0.0.1:8080` by default. Set `HOST_PORT` to expose a different host port without changing the container's runtime port.

The Compose healthcheck and CI smoke test exercise `GET /health` without cloud credentials. Authenticated `/chat` calls still require Google Application Default Credentials or an equivalent deployment identity supplied externally; credentials are never copied into the image or stored in this repository.

```bash
curl --fail http://127.0.0.1:8080/health
```

## Production error reporting

`startServer()` accepts an optional `onUnhandledError(error, context)` hook for wiring an external error tracker or alerting sink. The hook runs only for otherwise-unhandled HTTP errors that reach the final server boundary; normal validation failures, timeouts, client aborts, and the service's expected sanitized failure responses keep their existing behavior.

The callback receives the original error plus frozen, bounded context containing the failure scope and request ID. Reporter failures are isolated and logged as bounded metadata so an unavailable telemetry provider cannot change the HTTP result or create a second unhandled rejection.

```js
import { startServer } from './src/server.mjs';

startServer({
  onUnhandledError(error, context) {
    return captureException(error, { context });
  },
});
```

`captureException` represents the deployment's chosen monitoring integration and is intentionally not bundled into the service.

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
docker compose config --quiet
docker compose up --build --detach
curl --fail http://127.0.0.1:8080/health
```

The same checks run weekly so dependency/security and container startup state are re-evaluated against current code and advisories. Dependabot is configured for npm and GitHub Actions dependencies. Static analysis is also maintained separately through CodeQL. Drive-corpus import and verification workflows remain separate maintenance concerns.

## Release readiness

`npm run verify:release` checks the release metadata and provenance prerequisites that should be true before a semantic release is cut: stable package versioning, required maintained scripts, exact corpus verification, zero unresolved import failures, documented runtime environment keys, pull-request quality gates, container startup proof, and CodeQL coverage.

See `docs/RELEASE_READINESS.md` for the full release discipline. The document intentionally distinguishes a verified release-ready commit from an actual Git tag or hosted release; tags should represent real milestones and should not be manufactured for history.

## Privacy and IP scope

The assessment material is deidentified. Product names, original cloud identifiers, user/client references, credentials, private user records, and brand-specific application text are excluded or replaced with neutral assessment-safe equivalents. The repository is intended to preserve engineering signal without publishing secrets or client/customer data.

See `DEIDENTIFICATION_REPORT.md`, `IMPORT_REPORT.md`, and `VERIFY_REPORT.md` for the audit trail.
