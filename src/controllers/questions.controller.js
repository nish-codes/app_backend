
const skills = require("../db/skills.json")
const questions = (req, res) => {
    const { lvl, skill } = req.query;
    // Filter skills based on query
    const filtered = skills.filter(s => s.Difficulty == lvl && s.Skill == skill);

    if (filtered.length === 0) {
        return res.status(404).json({ message: 'No matching skill found' });
    }

    const skillObj = filtered[0]; // take the first matching object

    // Get numeric keys only
    const numericKeys = Object.keys(skillObj).filter(key => !isNaN(Number(key)));

    // Get values of numeric keys (the actual questions)
    const questions = numericKeys.map(key => skillObj[key]);

    // Picking random questions
    const getRandomItems = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);
    const randomQuestions = getRandomItems(questions, 15);

    res.json(randomQuestions);
}

export { questions };