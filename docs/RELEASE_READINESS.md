# Release Readiness

This document defines the repository's release-ready state for a real maintained service milestone. It is a verification contract, not a claim that a Git tag or hosted release already exists.

## Required state

A release candidate must satisfy all of the following on the exact proposed `main` commit:

- reproducible `npm ci --ignore-scripts`;
- dependency audit at moderate severity or higher;
- maintained lint and promoted-artifact integrity checks;
- enforced Jest coverage thresholds;
- exact live corpus verification with zero missing and zero unexpected files;
- zero unresolved import failures;
- valid maintained runtime configuration documentation;
- Docker Compose configuration, build, startup, and `GET /health` smoke;
- CodeQL JavaScript/TypeScript analysis;
- transactional corpus maintenance with pull-request review; and
- no credential or secret material committed to the repository.

The executable metadata/provenance portion of this contract is:

```bash
npm run verify:release
```

The normal maintained quality surface remains:

```bash
npm run check
```

Container startup is independently proven with:

```bash
docker compose up --build --detach
curl --fail http://127.0.0.1:8080/health
docker compose down --volumes --remove-orphans
```

## Version discipline

`package.json` carries the maintained service version. A release/tag should be created only after the exact target commit passes the pull-request quality workflow and CodeQL, lands on `main`, and the post-merge state has no new blocker.

Do not manufacture, backdate, or multiply releases to simulate project history. A new semantic version should correspond to a real maintained milestone with user-visible behavior, compatibility change, security hardening, or a substantial reliability/reproducibility improvement.

## Historical corpus boundary

The versioned corpus remains provenance and is not bulk-rewritten for a release. `ARCHIVE.md` defines the exact maintained promotions. Corpus refreshes and live-verification report changes must continue through the transactional, reviewed automation paths.

## Deployment boundary

Release readiness does not embed cloud credentials. Authenticated `POST /chat` execution still requires externally supplied Google Cloud identity and the maintained runtime variables documented in `.env.example`.
