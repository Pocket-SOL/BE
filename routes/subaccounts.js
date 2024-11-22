const express = require("express");
const router = express.Router();
const {
	SubAccount,
	SubAccountHistory,
	Sequelize,
	Account,
} = require("../models");
const { where } = require("sequelize");

/**
 * @swagger
 * api/subaccounts:
 *   get:
 *     tags:
 *       - SubAccounts
 *     summary: 유저(user_id)의 세부계좌별 잔액 조회
 *     description: Retrieve subaccount information, including total deposit and withdrawal, along with sub_account_usage.
 *     parameters:
 *       - in: query
 *         name: userId(유저아이디(pk))
 *         required: true
 *         schema:
 *           type: integer
 *           description: The ID of the user to retrieve subaccounts for.
 *     responses:
 *       200:
 *         description: A list of subaccounts with their transaction sums and usage.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sub_account_id:
 *                     type: integer
 *                     description: The ID of the subaccount.
 *                   total_deposit:
 *                     type: string
 *                     description: The total deposit amount in the subaccount.
 *                   total_withdrawal:
 *                     type: string
 *                     description: The total withdrawal amount from the subaccount.
 *                   subaccount:
 *                     type: object
 *                     properties:
 *                       sub_account_usage:
 *                         type: string
 *                         description: The type of usage for the subaccount (e.g., "고정" or "자유").
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error occurred"
 */

//user의 각 subaccount의 잔액 불러오기
router.get("/", async (req, res, next) => {
	const userId = req.query.userId;
	if (!userId) {
		return res.status(400).json({ message: "User ID is required" });
	}

	const account = await Account.findOne({ where: { user_id: userId } });
	SubAccountHistory.findAll({
		attributes: [
			"sub_account_id",
			[
				// 입금 합계
				Sequelize.fn(
					"SUM",
					Sequelize.literal(
						'CASE WHEN transaction_type = "입금" THEN amount ELSE 0 END',
					),
				),
				"total_deposit",
			],
			[
				// 출금 합계
				Sequelize.fn(
					"SUM",
					Sequelize.literal(
						'CASE WHEN transaction_type = "출금" THEN amount ELSE 0 END',
					),
				),
				"total_withdrawal",
			],
		],
		where: {
			sub_account_id: {
				[Sequelize.Op.in]: Sequelize.literal(
					`(SELECT sub_account_id FROM subaccount WHERE account_id = 2)`,
				),
			},
		},
		include: [
			{
				model: SubAccount, // SubAccount 모델을 포함시킴
				attributes: ["sub_account_usage"], // sub_account_usage 필드를 가져옵니다
				required: true, // SubAccountHistory에 해당하는 SubAccount만 포함
			},
		],
		group: ["sub_account_id"], // sub_account_id로만 그룹화
	})
		.then((result) => {
			res.json(result); // 결과 반환
		})
		.catch((error) => {
			console.error(error);
			res.status(500).json({ message: "Error occurred", error });
		});
});
module.exports = router;
