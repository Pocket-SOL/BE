const express = require("express");
const router = express.Router();

const { Quiz } = require("../models");

/**
 * @swagger
 * components:
 *   schemas:
 *     Quiz:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The quiz ID
 *         title:
 *           type: string
 *           description: The quiz title
 *         description:
 *           type: string
 *           description: The quiz description
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the quiz was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the quiz was last updated
 */

/**
 * @swagger
 * /api/quiz:
 *   get:
 *     summary: Retrieve all quizzes
 *     description: Get a list of all available quizzes
 *     tags: [Quiz]
 *     responses:
 *       200:
 *         description: A list of quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quiz'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

router.get("/", async (req, res) => {
	try {
		const quizList = await Quiz.findAll();
		res.json(quizList);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
