const express = require("express");
const router = express.Router();

const { Quiz } = require("../models");

router.get("/", async (req, res) => {
	try {
		const quizList = await Quiz.findAll();
		res.json(quizList);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
