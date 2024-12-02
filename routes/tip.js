const express = require("express");
const router = express.Router();

const { Tip } = require("../models");
/**
 * @swagger
 * components:
 *   schemas:
 *     Tip:
 *       type: object
 *       properties:
 *         tip_id:
 *           type: integer
 *           description: The tip ID
 *         tip:
 *           type: string
 *           description: The tip content
 */

/**
 * @swagger
 * /api/tip:
 *   get:
 *     summary: Retrieve all tips
 *     description: Get a list of all available tips
 *     tags: [Tip]
 *     responses:
 *       200:
 *         description: A list of tips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tip'
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
		const tipList = await Tip.findAll();
		res.json(tipList);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
