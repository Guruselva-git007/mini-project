export const calculatePriorityScore = ({
  reportCount,
  severity,
  createdAt,
  status
}) => {
  if (status === "Resolved") {
    return 0;
  }

  const safeReportCount = Math.max(reportCount ?? 1, 1);
  const safeSeverity = Math.min(Math.max(severity ?? 3, 1), 5);

  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageHours = Math.max(ageMs / (1000 * 60 * 60), 0);
  const ageFactor = Math.min(ageHours / 24, 14);

  const score = safeSeverity * 20 + safeReportCount * 12 + ageFactor * 2;
  return Number(score.toFixed(2));
};

export const priorityLabel = (score) => {
  if (score >= 140) return "Critical";
  if (score >= 90) return "High";
  if (score >= 50) return "Medium";
  return "Low";
};
