const express = require("express");
const router = express.Router();

const { Plea, Noti } = require("../models");

/**
 * @swagger
 * /api/plea/{id}:
 *   post:
 *     tags:
 *       - Plea
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
		const { amount, user_id } = req.body;
		const plea = await Plea.create({
			parent_id: ParentId,
			amount,
			user_id,
		});

		// if (plea) {
		// 	const pleaNoti = {
		// 		type: "PleaAllowance",
		// 		content: "용돈 요청이 도착했어요",
		// 		amount: amount,
		// 		status: "pending",
		// 		sender_id: ParentId,
		// 		receiver_id: user_id,
		// 		isread: false,
		// 	};
		// 	await Noti.create(pleaNoti);
		// }

		res.json({ ok: true, response: plea });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
