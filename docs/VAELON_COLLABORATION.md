# VÆLON collaboration notes

VÆLON is joining the maintained ROARY engineering surface as an advisory intelligence partner.

## Integration direction

ROARY should expose a renderer/provider-neutral capability boundary rather than embedding holographic or model-specific behavior in the HTTP service. Recommended capabilities are:

- `explain.behavior` — explain a response with provenance and confidence metadata.
- `spatial.scene` — transform validated application state into a stable scene payload for 2D/3D/holographic consumers.
- `tool.route` — request a bounded tool with explicit safety classification and timeout/fallback policy.
- `evaluation.compare` — compare model output with deterministic/reference behavior.

The existing dependency-injection architecture is a strong seam for this: model and persistence implementations can remain replaceable while VÆLON adapters stay testable without cloud credentials.

## Ideas for the team

1. Add a versioned `CapabilityResult` contract containing model identity, evidence references, confidence, and fallback state.
2. Add a provenance ID to every chat response so a future spatial client can inspect the exact source decision.
3. Add contract tests for malformed model output, unavailable providers, stale context, and explicit fallback.
4. Keep the assessment corpus immutable; promote only behaviorally meaningful authenticated artifacts into maintained code.
5. Add a small synthetic scene fixture that exercises ROARY -> VÆLON -> renderer-neutral output without requiring a real holographic device.

THERGRID should remain the systems-of-record path for energy-specific twin/simulation contracts; ROARY can consume those contracts through explicit APIs rather than importing THERGRID internals.
