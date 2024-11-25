const express = require("express");
const router = express.Router();
const { History } = require("../models");
const { where } = require("sequelize");

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
