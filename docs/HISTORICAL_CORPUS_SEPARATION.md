# Historical corpus separation contract

This document records the preservation boundary for the future scored application tree.

## Immutable released baseline

- Release tag: `v1.1.2`
- Release commit: `67e7a0c297451b438ed950ba743318e3f7454159`
- Release tree: `77e60e4488002dee7cf5e9f839bf23b4628b931b`
- Preservation branch: `archive/historical-corpus-v1.1.2`
- Historical corpus files: **1610**
- Historical corpus directories: **40**
- Historical corpus bytes: **1,731,712**
- Canonical inventory SHA-256: `52723960e5d5297151a48c646f21eb262324168f350acf34318fe4a60554d260`

The preservation branch points directly at the released commit, so every historical file remains available at its exact released path and Git object identity. Existing release `v1.1.2` is not rewritten or moved.

The complete path/hash/size inventory is committed at:

`provenance/HISTORICAL_CORPUS_V1_1_2_MANIFEST.json`

## Future main-tree boundary

The future application tree may remove the physical `Software Engineering & AI Tooling/` directory only after:

1. the complete manifest above is present and count-validated;
2. the preservation branch still resolves to the released baseline;
3. the three promoted maintained artifacts are copied into a maintained source path;
4. each promoted copy retains the same byte count, SHA-256, and Git blob identity recorded by the existing integrity manifest;
5. lint, tests, coverage, and integrity verification no longer depend on the archive directory;
6. clean pull-request CI and CodeQL pass on the exact proposed head.

## Promoted maintained artifacts

The three historically sourced artifacts already under active quality gates will move to `src/promoted/` while retaining an explicit source-path mapping back to the immutable archive branch.

No other historical snapshot becomes maintained code by implication.

## Non-goals

- No history rewrite.
- No backdating.
- No deletion of the released archive.
- No fabricated source.
- No change to the existing `v1.1.2` tag.
- No claim that the historical corpus is part of the future maintained application tree.

## Recovery

A reviewer can recover the complete released corpus by checking out:

`archive/historical-corpus-v1.1.2`

and can verify every corpus path/blob/size against the committed manifest.
