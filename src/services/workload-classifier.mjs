const WORKLOAD_TYPES = Object.freeze(['critical', 'flexible']);

export function classifyWorkload({ priority = 'normal', deadlineSensitive = false } = {}) {
  if (deadlineSensitive || priority === 'critical') {
    return 'critical';
  }

  return 'flexible';
}

export { WORKLOAD_TYPES };
