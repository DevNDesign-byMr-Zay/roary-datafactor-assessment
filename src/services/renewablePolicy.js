export function chooseExecutionStrategy({
  renewableAvailability = 0,
  urgency = "normal",
} = {}) {
  if (renewableAvailability >= 0.75 && urgency !== "critical") {
    return Object.freeze({
      strategy: "renewable-preferred",
      reason: "flexible workload shifted toward cleaner energy availability",
    });
  }

  return Object.freeze({
    strategy: "immediate",
    reason: "latency requirement prioritized",
  });
}
