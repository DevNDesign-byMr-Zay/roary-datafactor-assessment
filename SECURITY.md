# Security Policy

## Supported surface

Security maintenance applies to the maintained service under `src/`, the public runtime entrypoints, dependency manifests and lockfiles, release/CI automation, and the explicitly promoted artifacts listed by the maintained-surface boundary.

The preserved historical corpus is provenance material. It is not silently rewritten, bulk-promoted, or treated as active runtime code during routine security maintenance.

## Reporting a vulnerability

Do not open a public issue containing credentials, tokens, private keys, personal identifiers, customer data, or exploit details that could expose a real deployment.

Use GitHub private vulnerability reporting when it is available for this repository. Otherwise, contact the repository owner privately through an existing trusted channel and include:

- the affected maintained file or runtime boundary;
- a minimal reproducer;
- expected versus observed behavior;
- whether credentials, identity, persistence, or provider boundaries are involved; and
- any known safe workaround.

## Security expectations

Changes touching authentication, provider errors, persistence, corpus integrity, release automation, or evidence identity should include a regression for the relevant failure path.

The maintained quality gates include reproducible locked installs, dependency audit, type checking, linting, promoted-surface integrity verification, enforced coverage, container verification, CodeQL, and exact corpus verification.

Never lower a security or quality threshold merely to make a change pass.
