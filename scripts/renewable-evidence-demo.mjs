import {
  createWorkloadFlexibilityEvidence,
  validateWorkloadFlexibilityEvidence,
} from '../src/services/workload-flexibility-evidence.mjs';
import { createRenewableOpportunityAdvisory } from '../src/services/renewable-opportunity-advisory.mjs';

const workloadSource = {
  workloadId: 'demo-flexible-workload-001',
  priority: 'normal',
  deferrable: true,
  maxDelayMinutes: 30,
  interruptible: false,
};

const classification = createWorkloadFlexibilityEvidence(workloadSource);
if (!validateWorkloadFlexibilityEvidence(classification, workloadSource)) {
  throw new Error('workload flexibility evidence failed validation');
}

const opportunity = createRenewableOpportunityAdvisory({
  renewableAvailability: 0.8,
  priority: workloadSource.priority,
  renewableWindowMinutes: workloadSource.maxDelayMinutes,
});

if (classification.classification !== 'flexible') {
  throw new Error('demo workload must produce explicit flexibility evidence');
}
if (opportunity.opportunity !== 'renewable-window-available') {
  throw new Error('demo renewable input must produce an advisory opportunity');
}
if (
  classification.safety.advisoryOnly !== true ||
  classification.safety.authoritative !== false ||
  classification.safety.schedulesWorkload !== false ||
  classification.safety.delaysWorkload !== false ||
  classification.safety.interruptsWorkload !== false ||
  classification.safety.executesWorkload !== false ||
  classification.safety.physicalActuation !== false
) {
  throw new Error('workload classification crossed its evidence-only boundary');
}
if (
  opportunity.safety.advisoryOnly !== true ||
  opportunity.safety.authoritative !== false ||
  opportunity.safety.schedulesWorkload !== false ||
  opportunity.safety.delaysWorkload !== false ||
  opportunity.safety.executesWorkload !== false ||
  opportunity.safety.physicalActuation !== false
) {
  throw new Error('renewable opportunity crossed its advisory-only boundary');
}
if (
  'strategy' in opportunity ||
  'shouldExecute' in opportunity ||
  'executeAt' in opportunity ||
  'queue' in opportunity
) {
  throw new Error('renewable opportunity must not expose execution-policy fields');
}

const summary = {
  workloadId: classification.workloadId,
  workloadEvidenceFingerprint: classification.evidenceFingerprint,
  classification: classification.classification,
  classificationSource: classification.source,
  renewableAvailability: opportunity.evidence.renewableAvailability,
  renewableWindowMinutes: opportunity.evidence.renewableWindowMinutes,
  opportunity: opportunity.opportunity,
  application: opportunity.application,
  interpretation: classification.interpretation,
  schedulesWorkload: opportunity.safety.schedulesWorkload,
  delaysWorkload: opportunity.safety.delaysWorkload,
  executesWorkload: opportunity.safety.executesWorkload,
  authoritative: opportunity.safety.authoritative,
};

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
