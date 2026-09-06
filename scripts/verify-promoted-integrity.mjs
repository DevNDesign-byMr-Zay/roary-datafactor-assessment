import { verifyPromotedCorpusIntegrity } from '../src/corpus-integrity.mjs';

const report = await verifyPromotedCorpusIntegrity();
console.log(
  `verified ${report.verified.length} promoted corpus artifacts against deterministic integrity manifest`,
);
