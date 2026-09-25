# Historical Corpus Boundary

## Purpose

The scored application tree contains maintained ROARY software only. The complete historical/versioned engineering corpus remains preserved as immutable released provenance rather than as 1,610 source files beside the application.

## Immutable preservation point

- Release: `v1.1.2`
- Release commit: `67e7a0c297451b438ed950ba743318e3f7454159`
- Preservation branch: `archive/historical-corpus-v1.1.2`
- Released corpus files: **1,610**
- Released corpus directories: **40**
- Released corpus bytes: **1,731,712**
- Canonical inventory SHA-256: `52723960e5d5297151a48c646f21eb262324168f350acf34318fe4a60554d260`

The complete per-file path, Git blob SHA-1, byte count, and mode inventory is committed at `provenance/HISTORICAL_CORPUS_V1_1_2_MANIFEST.json`.

## Maintained promoted copies

Three historically sourced final artifacts remain under active tests, lint, coverage, and integrity verification as byte-identical maintained copies:

- `src/promoted/auth-middleware.mjs`
- `src/promoted/cors-policy.mjs`
- `src/promoted/sign-route.mjs`

`provenance/PROMOTED_CORPUS_INTEGRITY.json` records each maintained path together with its original archive path, byte count, SHA-256, Git blob identity, release tag, release commit, and archive branch.

## Scored-tree contract

The historical `Software Engineering & AI Tooling/` directory must not exist in the future scored application tree.

`npm run verify:surface` fails if:

- the physical historical directory reappears;
- the archive release/tag/tree/count/digest contract drifts;
- the full manifest stops listing all 1,610 released files; or
- a promoted maintained copy loses its recorded archive identity.

`npm run verify:integrity` independently hashes the three promoted maintained copies and rejects byte drift.

## Corpus maintenance

Future archive refreshes must happen on an archive-specific branch or repository surface. They must not write the complete corpus back into application `main`.

No release tag or existing Git history is rewritten by this separation.
