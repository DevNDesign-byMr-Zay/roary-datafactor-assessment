## Objective
Describe the smallest problem this PR solves and why it belongs in the maintained service path.

## Scope
- What changed:
- What was intentionally left unchanged:
- Related issue/PR:

## Runtime / evidence boundary
- Input or evidence producer:
- Identity or fields trusted by this change:
- Inputs rejected, sanitized, or treated as diagnostic-only:
- Authority explicitly **not** added by this PR:

## Validation
- [ ] `npm ci --ignore-scripts` succeeds from a clean checkout.
- [ ] Maintained typecheck/lint/integrity gates pass.
- [ ] Focused tests cover the behavior or failure path.
- [ ] Coverage and dependency-audit thresholds remain intact.
- [ ] CodeQL/security gate passes on the exact head.
- [ ] Historical corpus files were not rewritten for cosmetic quality gains.
- [ ] No secrets, credentials, customer data, or private identifiers were added.

## Reviewer attack surface
List the stale, malformed, replayed, cross-artifact, provider-error, identity, or persistence cases reviewers should try.

## Merge note
If stacked, state merge order and retest plan. Otherwise write `not stacked`.
