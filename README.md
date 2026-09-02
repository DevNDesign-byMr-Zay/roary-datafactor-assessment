# Software Engineering & AI Tooling — Deidentified Assessment Repository

This repository contains the complete deidentified **Software Engineering & AI Tooling** assessment corpus plus a runnable conversational-AI reference service used to exercise the repository's backend engineering patterns.

## Corpus completeness

The mirrored corpus lives under `Software Engineering & AI Tooling/` and spans application bootstrap, reliability and infrastructure, AI model integration, storage and file services, cloud deployment, authentication and security, API foundations, full-stack workflows, backend engineering, and frontend engineering.

`VERIFY_REPORT.md` is generated from a fresh recursive probe of the source Drive folder. The current verification is **1,610 expected / 1,610 present, 0 missing, 0 unexpected**.

## Architecture

The maintained reference service is intentionally layered instead of monolithic:

- `index.mjs` — minimal executable/export entrypoint.
- `src/app.mjs` — Express application factory and HTTP boundary.
- `src/cloud.mjs` — lazy production construction of Vertex AI and Firestore dependencies.
- `src/history-store.mjs` — conversation persistence abstraction.
- `src/model-response.mjs` — defensive provider-response text extraction.
- `src/validation.mjs` — Zod request-boundary validation.
- `src/logger.mjs` — structured Pino logging.
- `src/server.mjs` — process startup and port binding.
- `index.test.mjs` — credential-free Supertest/Jest endpoint tests using injected doubles.

The application factory accepts cloud/database dependencies, so importing or testing the service does **not** require Google Application Default Credentials and does not bind a network port.

## Fresh-clone setup

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/DevNDesign-byMr-Zay/roary-datafactor-assessment.git
cd roary-datafactor-assessment
npm ci
npm test
npm run lint
```

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

`text` is required and bounded; `sessionId` is bounded and defaults to `default`. Invalid payloads return a structured 400 response. Provider failures return a sanitized 500 without exposing raw exception strings.

## Quality gates

Every push is expected to pass:

```bash
npm ci
npm audit --audit-level=high
npm run lint
npm test
```

The repository also contains weekly Dependabot configuration for npm and GitHub Actions dependencies, reproducible lockfile automation, and Drive-corpus import/verification workflows.

## Privacy and IP scope

The assessment material is deidentified. Product names, original cloud identifiers, user/client references, credentials, private user records, and brand-specific application text are excluded or replaced with neutral assessment-safe equivalents. The repository is intended to preserve engineering signal without publishing secrets or client/customer data.

See `DEIDENTIFICATION_REPORT.md`, `IMPORT_REPORT.md`, and `VERIFY_REPORT.md` for the audit trail.
