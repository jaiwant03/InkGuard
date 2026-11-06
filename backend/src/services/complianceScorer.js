/**
 * Calculates a reliable, explainable compliance score based on verified findings.
 * High severity = -15 points (Legal/regulatory, brand risk, prohibited claims)
 * Medium severity = -7 points (Terminology, tone deviation, unverified fact)
 * Low severity = -2 points (Minor styling, accessibility advice)
 */
export function calculateComplianceScore(findings = []) {
  const activeFindings = findings.filter((f) => f.status !== 'dismissed');

  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  activeFindings.forEach((f) => {
    if (f.severity === 'High') highCount++;
    else if (f.severity === 'Medium') mediumCount++;
    else if (f.severity === 'Low') lowCount++;
  });

  const penalty = highCount * 15 + mediumCount * 7 + lowCount * 2;
  const rawScore = 100 - penalty;
  const score = Math.max(0, Math.min(100, rawScore));

  let grade = 'Excellent';
  let gradeExplanation = 'The draft adheres closely to established brand standards with no significant deviations.';

  if (score < 55 || highCount >= 3) {
    grade = 'High Risk';
    gradeExplanation = 'Critical compliance violations detected. Substantive revision is required before external publication.';
  } else if (score < 75 || highCount >= 1) {
    grade = 'Needs Revision';
    gradeExplanation = 'Several moderate or high-severity issues should be resolved before submitting for final reviewer sign-off.';
  } else if (score < 90) {
    grade = 'Strong';
    gradeExplanation = 'Good brand consistency with minor terminology or tone adjustments suggested.';
  }

  return {
    score,
    grade,
    gradeExplanation,
    summary: {
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      total: activeFindings.length,
      dismissed: findings.filter((f) => f.status === 'dismissed').length,
    },
    scoringFormula: 'Score = 100 - (High × 15 + Medium × 7 + Low × 2), bounded between 0 and 100.',
  };
}
