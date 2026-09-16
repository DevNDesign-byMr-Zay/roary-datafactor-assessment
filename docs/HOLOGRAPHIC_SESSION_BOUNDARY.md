# Holographic session boundary

The holographic surface is an operator-facing consumer of validated state. Session identity protects the display handoff from cross-session replay, while upstream service boundaries remain responsible for authorization, persistence, and scenario meaning.

## Session lineage

A surface dispatch must remain bound to the display session that produced it. Session, scene, packet, and dispatch fingerprints are evidence of lineage and integrity; none of them grant permission to execute arbitrary adapter operations.

Cross-session replay, scene/session identity swaps, stale or tampered fingerprints, inherited operations, and undeclared adapter capabilities must fail closed.

## Adapter boundary

Adapters are explicit presentation integrations. The dispatch layer accepts only operations declared by the supported adapter contract. Inherited properties, prototype tricks, accessors, or undeclared operation names must not create an execution path.

Adapter result data is evidence returned from an explicitly selected presentation operation. It does not widen the session's advisory-only, non-authoritative, non-actuating safety boundary.

## Relationship to the broader stack

`validated state → bound scene packet → display session → explicit adapter dispatch → operator display`

This surface can evolve toward richer spatial experiences without becoming a second authority for scenario meaning, provenance, scheduling, deployment, or physical execution.

## Review invariant

When the session or dispatch contract changes, reviewers should verify both sides of the boundary:

- legitimate current scene/session/adapter shapes still validate and dispatch;
- replay, substitution, inherited fields, accessors, prototype-named fields, symbols, and fingerprint tampering fail closed before downstream presentation work is trusted.
