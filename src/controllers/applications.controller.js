const skillWeights = {
  beginner: 0.5,
  mid: 1,
  adv: 1.5
};

function calculateSkillScore(job, student) {
  const requiredSkills = job.preferences?.skills || [];
  const studentSkills = Array.from(student.user_skills.keys());

  let score = 0;
  const maxScore = requiredSkills.length * 1.5; // max if all skills are "adv"

  requiredSkills.forEach(skill => {
    if (studentSkills.includes(skill)) {
      const level = student.user_skills.get(skill).level;
      score += skillWeights[level] || 0;
    }
  });

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

export { calculateSkillScore };