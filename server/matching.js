// Deterministic matching engine: ranks freelancers for a task.
// Score = skills (60) + budget fit (25) + rating (15).

const HOURS_ESTIMATE = 8;
const SKILL_WEIGHT = 60;
const BUDGET_WEIGHT = 25;
const RATING_WEIGHT = 15;

export function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  const seen = new Set();
  for (const raw of skills) {
    const value = String(raw ?? '').trim().toLowerCase();
    if (value) seen.add(value);
  }
  return [...seen];
}

export function scoreFreelancer(task, freelancer) {
  const wanted = normalizeSkills(task.skills);
  const have = new Set(normalizeSkills(freelancer.skills));
  const matchedSkills = wanted.filter((skill) => have.has(skill));

  const skillScore = wanted.length
    ? (matchedSkills.length / wanted.length) * SKILL_WEIGHT
    : 0;

  const budget = Number(task.budget) || 0;
  const estimatedCost = freelancer.ratePerHour * HOURS_ESTIMATE;
  let budgetScore = 0;
  if (budget > 0 && estimatedCost > 0) {
    budgetScore =
      estimatedCost <= budget
        ? BUDGET_WEIGHT
        : Math.max(0, BUDGET_WEIGHT * (budget / estimatedCost));
  }

  const ratingScore = (Math.min(Number(freelancer.rating) || 0, 5) / 5) * RATING_WEIGHT;
  const score = Math.round(skillScore + budgetScore + ratingScore);

  const reasons = [];
  if (wanted.length && matchedSkills.length) {
    reasons.push(`Matches ${matchedSkills.length}/${wanted.length} required skills`);
  } else if (wanted.length) {
    reasons.push('No skill overlap with this task');
  }
  if (budget > 0 && estimatedCost > 0) {
    reasons.push(
      estimatedCost <= budget
        ? `Fits the $${budget} budget (est. $${estimatedCost} for ${HOURS_ESTIMATE}h)`
        : `Above budget (est. $${estimatedCost} for ${HOURS_ESTIMATE}h)`
    );
  }
  reasons.push(`Rated ${freelancer.rating}/5 across ${freelancer.completedTasks} tasks`);

  return {
    id: freelancer.id,
    name: freelancer.name,
    headline: freelancer.headline,
    country: freelancer.country,
    ratePerHour: freelancer.ratePerHour,
    rating: freelancer.rating,
    completedTasks: freelancer.completedTasks,
    skills: freelancer.skills,
    matchedSkills,
    score,
    reasons
  };
}

export function rankFreelancers(task, freelancers) {
  return freelancers
    .map((freelancer) => scoreFreelancer(task, freelancer))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.rating - a.rating ||
        a.ratePerHour - b.ratePerHour ||
        a.id.localeCompare(b.id)
    );
}
