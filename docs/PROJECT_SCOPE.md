# Project Scope

This repository is primarily a **Node.js application service** with maintained conversational-AI runtime, validation, persistence, observability, testing, release verification, and container-startup surfaces.

It also preserves a deidentified historical software-engineering corpus for provenance. That historical corpus is not the primary runtime and is not treated as a homogeneous production application.

## Maintained application surface

The active service surface is defined by:

- `src/` for maintained runtime and service modules.
- `tests/` plus `index.test.mjs` for maintained behavioral verification.
- `index.mjs` as the executable/package entrypoint.
- `scripts/` for maintained verification and evidence tooling.
- `config/repository-surfaces.json` for the machine-verified split between maintained code and preserved historical material.

Selected authenticated historical artifacts may be promoted into active lint, coverage, and regression gates only when they are explicitly listed in the surface manifest.

## Historical corpus boundary

`Software Engineering & AI Tooling/` is preserved development history and provenance. It remains available for inspection and integrity verification, but it is not the primary application surface.

The repository is **not an infrastructure-as-code repository**. Docker, Compose, GitHub Actions, and cloud-oriented examples support application build, verification, deployment, and historical provenance; they do not define the repository's primary class.

## Classification contract

`.repo-class.json` is the machine-readable classification source. Release readiness should fail if the primary class drifts away from `application-service`, if infrastructure-as-code is no longer explicitly excluded, or if this scope document disappears.
