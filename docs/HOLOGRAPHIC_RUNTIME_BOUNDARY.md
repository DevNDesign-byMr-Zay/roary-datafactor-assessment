# Holographic runtime boundary

Roary's holographic layer is organized as a renderer-neutral chain:

`logical scene -> calibration -> interaction event -> scene packet -> display session -> interaction session`

## Calibration

Logical 3D coordinates are mapped through an explicit calibration profile. The source logical scene remains unchanged so calibration can be audited and replaced independently of scene generation.

## Interaction

Interaction events describe presentation intent (`focus`, `select`, `activate`, `inspect`, or `dismiss`) without authorizing hardware actuation. Resolution is deterministic and does not mutate the scene.

## Sessions and integrity

Display and interaction sessions package validated packets with deterministic fingerprints and explicit safety metadata. Tampering, scene/session mismatches, and malformed events should fail closed.

## Collaboration targets

- Connect session output to the renderer adapters without weakening the safety boundary.
- Add multi-surface fixtures for HoloMat, projector, and 3D presentation targets.
- Preserve the same scene/provenance identity across calibration and interaction layers.
- Keep physical device control outside these contracts until a separate, explicitly authorized interface exists.
