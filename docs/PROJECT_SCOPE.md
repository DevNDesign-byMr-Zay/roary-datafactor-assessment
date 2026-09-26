# Project Scope

This repository is primarily a **Node.js application service** with maintained conversational-AI runtime, validation, persistence, observability, testing, release verification, and container-startup surfaces.

A complete deidentified historical software-engineering corpus is preserved at release `v1.1.2` and branch `archive/historical-corpus-v1.1.2`. It is intentionally external to the scored application tree.

## Maintained application surface

The active service surface is defined by:

- `src/` for maintained runtime and service modules.
- `tests/` plus `index.test.mjs` for maintained behavioral verification.
- `index.mjs` as the executable/package entrypoint.
- `scripts/` for maintained verification and evidence tooling.
- `config/repository-surfaces.json` for the machine-verified split between maintained code and preserved historical material.

Historically sourced artifacts may enter active lint, coverage, and regression gates only as explicitly listed maintained copies with immutable archive provenance.

## Historical archive boundary

The future application tree does not contain the physical `Software Engineering & AI Tooling/` corpus directory. The full 1,610-file released corpus remains recoverable from the archive branch, and the complete released path/blob/size inventory is committed under `provenance/`.

The repository is **not an infrastructure-as-code repository**. Docker, Compose, GitHub Actions, and cloud-oriented examples support application build, verification, deployment, and historical provenance; they do not define the repository's primary class.

## Classification contract

`.repo-class.json` is the machine-readable classification source. Release readiness should fail if the primary class drifts away from `application-service`, if infrastructure-as-code is no longer explicitly excluded, or if this scope document disappears.
