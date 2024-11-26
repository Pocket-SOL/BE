const express = require("express");
const router = express.Router();

const { Plea } = require("../models");

/**
 * @swagger
 * /pleas/{id}:
 *   post:
 *     tags:
 *       - Pleas
 *     summary: Create a new plea
 *     description: Creates a new plea with the specified parent ID and amount
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 description: The plea amount
 *                 example: 10000
 *     responses:
 *       200:
 *         description: Successfully created plea
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: object
 *                   properties:
 *                     plea_id:
 *                       type: integer
 *                       example: 1
 *                     parent_id:
 *                       type: integer
 *                       example: 1
 *                     amount:
 *                       type: number
 *                       example: 10000
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error message"
 */

router.post("/:id", async (req, res) => {
	try {
		const ParentId = req.params.id;
		const { amount } = req.body;
		const plea = await Plea.create({
			parent_id: ParentId,
			amount,
		});
		res.json({ ok: true, response: plea });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
