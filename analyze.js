import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  const { skills } = req.body;

  // Mock logic (replace with RAG + KG later)
  const demandedSkills = ["Python", "Cloud", "SQL", "AI"];
  const userSkills = skills.split(",").map(s => s.trim());

  const missing = demandedSkills.filter(
    s => !userSkills.includes(s)
  );

  res.json({
    message: `Gap detected → Missing skills: ${missing.join(", ")}`
  });
});

export default router;
