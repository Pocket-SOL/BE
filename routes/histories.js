const express = require("express");
const router = express.Router();
const { History } = require("../models");
const { where } = require("sequelize");

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - History
 *     summary: Retrieve a specific history by ID
 *     description: Fetches the details of a transaction history using its ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the transaction history to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the history.
 *         content:
 *           application/json:
 *             example:
 *               history_id: 2
 *               date: "2024-11-20"
 *               time: "10:01:00"
 *               transaction_type: "출금"
 *               account_holder: "붕어빵"
 *               account_number: "계좌번호"
 *               amount: "200.00"
 *               photo: null
 *               account_id: 2
 *               bank: null
 *       400:
 *         description: Missing or invalid History ID.
 *         content:
 *           application/json:
 *             example:
 *               message: "History ID is required"
 *       500:
 *         description: Internal server error.
 */
router.get("/", (req, res, next) => {
	const historyId = req.query.id;
	if (!historyId) {
		return res.status(400).json({ message: "History ID is required" });
	}

	History.findOne({ where: { history_id: historyId } })
		.then((history) => {
			return res.json(history);
		})
		.catch((err) => {
			next(err);
		});
});

module.exports = router;
