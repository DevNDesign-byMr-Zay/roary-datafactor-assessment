# Drive Import Report

- Source folder ID: `1oUiGwTRyBuDRNsy6bRyx7v78d94ASEYs`
- Recursive Drive entries discovered by the latest attempted refresh: **1610**
- Assessment-relevant source/configuration entries selected: **1610**
- Files downloaded successfully during that attempt: **1609**
- Transient direct-download failures during that attempt: **1**
- Previously verified repository file restored byte-for-byte from Git history: **1**
- Final repository corpus after repair: **1610 / 1610**
- Unresolved repository gaps: **0**
- Non-source/binary entries excluded: **0**
- Files in duplicate-path groups preserved with Drive-ID suffixes: **615**
- Direct-download workers: **32**

The latest legacy refresh encountered a transient HTTP 503 while fetching one source file. That older importer deleted the live mirror before downloads completed, so the blocked fetch removed a previously valid repository file. The file has been restored from its exact prior Git blob; no source was reconstructed or regenerated.

Future refreshes are transactional. All selected files download into a temporary tree first. If any fetch is blocked, the workflow fails and the existing verified corpus remains untouched. A complete refresh is published to a dedicated automation branch and reviewed through normal pull-request CI and CodeQL before it can reach `main`.
