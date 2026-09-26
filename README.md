# ROARY Conversational AI Service

ROARY is a maintained Node.js conversational-AI **application service** with validated HTTP request boundaries, Vertex AI integration, Firestore-backed conversation history, structured observability, deterministic tests, and reproducible container/release verification.

The active engineering surface lives in `src/`, `tests/`, `scripts/`, `index.mjs`, and `index.test.mjs`. The complete deidentified historical engineering corpus is preserved outside the scored application tree at release `v1.1.2` and branch `archive/historical-corpus-v1.1.2`; its 1,610 released paths and Git blob identities are recorded in `provenance/HISTORICAL_CORPUS_V1_1_2_MANIFEST.json`.

## Maintained application architecture

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

## Historical corpus provenance

The complete released corpus remains recoverable from `archive/historical-corpus-v1.1.2`, which points directly at release commit `67e7a0c297451b438ed950ba743318e3f7454159`. The release contains **1,610 corpus files / 40 directories / 1,731,712 bytes** under the historical corpus root.

The future scored application tree does not carry those 1,610 historical snapshots as active source. The canonical path/blob/size inventory is committed under `provenance/`, and `npm run verify:surface` fails if the archive contract drifts or the physical corpus reappears in the application tree.

## Maintained and measured surface

The quality surface includes every module under `src/`, including three byte-identical promoted copies whose original released paths remain recorded in provenance metadata:

- **Authentication & Security** — `src/promoted/auth-middleware.mjs`
- **API Foundations** — `src/promoted/cors-policy.mjs`
- **Storage & File Services** — `src/promoted/sign-route.mjs`

These promoted copies retain the exact released Git blob identities and SHA-256 values of their archived sources. Their tests cover authorization success/failure, fail-closed configuration, preflight behavior, CORS allow/deny/error propagation, signed-read URL generation, validation, missing configuration, and signing failures.


### Machine-readable repository surfaces

`config/repository-surfaces.json` declares the active runtime/test roots, the immutable historical archive reference, and the byte-identical maintained copies promoted into blocking quality gates. `npm run verify:surface` validates that split in CI and requires the physical corpus to stay outside the scored application tree.

## Fresh-clone setup

Requirements: Node.js 22+ and npm.

```bash
git clone https://github.com/DevNDesign-byMr-Zay/roary-datafactor-assessment.git
cd roary-datafactor-assessment
npm ci
npm run check
```

`npm run check` now mirrors the complete non-container maintained verification lane: staged JavaScript type-checking, maintained/archive surface validation, lint, promoted-artifact integrity, release-readiness verification, enforced Jest coverage, and the deterministic renewable-evidence demo. The global coverage floor is 85% for statements/functions/lines and 75% for branches across the measured surface.

For production execution, copy `.env.example` values into your deployment environment and configure Google Application Default Credentials. No credential files belong in this repository.

```bash
npm start
```

Default port: `8080`.

### Container startup

The existing Dockerfile and Compose definition provide a one-command startup path from a fresh checkout:

```bash
docker compose -f docker-compose.yml up --build
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

Returns HTTP 200 with service identity, `status`, package-aligned `version`, `uptimeSeconds`, project/location, and model metadata.

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
npm test
npm run test:coverage
docker compose -f docker-compose.yml config --quiet
docker compose up --build --detach
curl --fail http://127.0.0.1:8080/health
```

The coverage suite is explicitly executed with `GOOGLE_APPLICATION_CREDENTIALS` removed from its environment, proving the injected test doubles do not depend on a live GCP account. CI retains the generated Jest `coverage/` directory as a 30-day coverage artifact so reviewers can inspect per-file results over time.

The workflow also exposes plainly named `typecheck`, `lint`, `test`, and `coverage` jobs so automated repository scanners can detect the same blocking gates without interpreting an aggregate script. A separate `fresh-clone-smoke` job disables dependency caching, removes local build state, performs the locked install and full maintained check, rebuilds the container with `--no-cache`, and probes `GET /health`.

Dependency/security state is re-evaluated on schedule. A dedicated dependency-freshness workflow records `npm outdated --json` as a machine-readable artifact without automatically changing versions. Dependabot remains configured for npm and GitHub Actions, and CodeQL remains the static security-analysis gate. Historical-corpus maintenance remains an archive-only concern and must not repopulate the scored application tree.

## Release readiness

`npm run verify:release` checks the release metadata and provenance prerequisites that should be true before a semantic release is cut: stable package versioning, required maintained scripts, immutable archive-manifest verification, documented runtime environment keys, pull-request quality gates, container startup proof, and CodeQL coverage.

See `docs/RELEASE_READINESS.md` for the full release discipline. The document intentionally distinguishes a verified release-ready commit from an actual Git tag or hosted release; tags should represent real milestones and should not be manufactured for history.

## Privacy and IP scope

The assessment material is deidentified. Product names, original cloud identifiers, user/client references, credentials, private user records, and brand-specific application text are excluded or replaced with neutral assessment-safe equivalents. The repository is intended to preserve engineering signal without publishing secrets or client/customer data.

See `DEIDENTIFICATION_REPORT.md`, `IMPORT_REPORT.md`, and `VERIFY_REPORT.md` for the audit trail.
