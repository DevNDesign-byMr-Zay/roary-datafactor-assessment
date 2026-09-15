# Holographic session boundary

The holographic surface is an operator-facing consumer of validated state. Session identity protects the display handoff from cross-session replay, while the underlying service remains responsible for its own authorization and persistence boundaries.

## Session lineage

A surface dispatch must remain bound to the session that produced it. The session fingerprint and related provenance are evidence of lineage, not permission to execute arbitrary adapter operations.

Cross-session display replay, identity swaps, tampered fingerprints, and inherited or undeclared adapter operations must fail closed.

## Adapter boundary

Adapters are explicit presentation integrations. The dispatch layer should accept only operations declared by the supported adapter contract; inherited properties or prototype tricks must not smuggle additional operations across the boundary.

## Relationship to the broader stack

`reference service / validated state → bound holographic session → explicit adapter dispatch → operator display`

This surface can evolve toward richer spatial experiences without becoming a second authority for scenario meaning, provenance, or physical execution.
