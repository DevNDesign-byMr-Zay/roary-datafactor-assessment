# Deidentification Report

## Status

**PASS — full assessment corpus, deidentified and verified**

## Scope

The complete deidentified `Software Engineering & AI Tooling` corpus was imported and verified at release `v1.1.2` (`67e7a0c297451b438ed950ba743318e3f7454159`) on preservation branch `archive/historical-corpus-v1.1.2`. The historical corpus contains **1,610 expected files / 1,610 released files, zero missing, zero unexpected**. The active `main` branch externalizes the physical corpus outside the scored application tree while preserving its complete path/blob/size inventory in `provenance/HISTORICAL_CORPUS_V1_1_2_MANIFEST.json`.

## Transformations and safeguards

- Replaced original product/assistant naming with neutral assessment terminology where required.
- Replaced original cloud-project fallback identifiers with `assessment-project`.
- Replaced brand-specific system-prompt and application language with neutral behavior text where required for assessment safety.
- Preserved engineering source/configuration artifacts while excluding secrets and private customer/user data.
- Added only non-secret environment placeholders.
- Regenerated and now maintain dependency metadata from the deidentified package manifest.
- Added automated Drive import and exact live-corpus verification so omissions are surfaced rather than silently accepted.

## Preserved engineering signal

The repository preserves frontend, backend, full-stack, infrastructure, authentication/security, cloud-deployment, storage/file-service, API, AI-model-integration, and application-bootstrap engineering material. The maintained reference service additionally demonstrates Express routing, Vertex AI integration, Firestore persistence, dependency injection, bounded history retrieval, schema validation, structured logging, defensive SDK response parsing, health checks, sanitized error handling, automated tests, linting, dependency auditing, and CI.

## Sensitive-data check

No API keys, access tokens, passwords, private user records, production credentials, or client/customer identifiers are intentionally included. Any future corpus update must pass the same deidentification and exact-verification requirements before being treated as complete.
