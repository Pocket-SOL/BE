const express = require("express");
const router = express.Router();
const {
	Account,
	History,
	SubAccount,
	SubAccountHistory,
	ScheduledTransfer,
} = require("../models");
const { where } = require("sequelize");
const { PARENT_BANK, CHILD_BANK } = require("../util/account_const");

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     tags:
 *       - Accounts
 *     summary: 유저의 잔액 조회 api
 *     description: 쿼리 파라미터로 받아온 유저(id=user_id)에 대한 잔액
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 유저 아이디(pk)
 *     responses:
 *       200:
 *         description: 유저의 잔액
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAmount:
 *                   type: number
 *                   description: 유저의 계좌 잔액
 *                   example: 5800
 */

//user의 계좌잔액 불러오기
router.get("/", (req, res, next) => {
	const userId = req.query.id;
	if (!userId) {
		return res.status(400).json({ message: "User ID is required" });
	}

	Account.findOne({ where: { user_id: userId } })
		.then((account) => {
			if (!account) {
				return res.status(404).json({ message: "Account not found" });
			}

			History.sum("amount", {
				where: { account_id: account.account_id, transaction_type: "입금" },
			})
				.then((inputAmount) => {
					const amount = inputAmount;
					History.sum("amount", {
						where: { account_id: account.account_id, transaction_type: "출금" },
					}).then((outputAmount) => {
						res.json({ totalAmount: amount - outputAmount });
					});
				})
				.catch((err) => {
					next(err);
				});
		})
		.catch((err) => {
			next(err);
		});
});

//user의 계좌 이용 내역
/**
 * @swagger
 * /api/accounts/history:
 *   get:
 *     tags:
 *       - Accounts
 *     summary: 계좌의 거래 내역 조회
 *     description: 특정 유저(user_id)의 계좌의 거래 내역을 조회합니다.
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 조회할 유저 ID (=> 해당 유저 계좌의 히스토리내역)
 *     responses:
 *       200:
 *         description: 거래 내역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   history_id:
 *                     type: integer
 *                     description: 거래 내역 ID
 *                     example: 1
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: 거래 날짜
 *                     example: "2024-11-20"
 *                   time:
 *                     type: string
 *                     format: time
 *                     description: 거래 시간
 *                     example: "10:00:00"
 *                   transaction_type:
 *                     type: string
 *                     description: 거래 유형 (입금/출금)
 *                     example: "입금"
 *                   account_holder:
 *                     type: string
 *                     description: 거래 상대자 이름
 *                     example: "도은"
 *                   account_number:
 *                     type: string
 *                     description: 거래 계좌 번호
 *                     example: "계좌번호"
 *                   amount:
 *                     type: string
 *                     format: decimal
 *                     description: 거래 금액
 *                     example: "1000.00"
 *                   photo:
 *                     type: string
 *                     format: binary
 *                     nullable: true
 *                     description: 거래와 관련된 사진 (있을 경우)
 *                     example: null
 *                   account_id:
 *                     type: integer
 *                     description: 계좌 ID
 *                     example: 2
 *                   bank:
 *                     type: string
 *                     nullable: true
 *                     description: 은행 이름 (정보가 없으면 null)
 *                     example: null
 */

router.get("/history", (req, res, next) => {
	const userId = req.query.id;
	if (!userId) {
		return res.status(400).json({ message: "User Id is required" });
	}
	Account.findOne({ where: { user_id: userId } }).then((account) => {
		if (!account) {
			return res.status(404).json({ message: "Account not found" });
		}
		History.findAll({ where: { account_id: account.account_id } })
			.then((history) => {
				res.json(history);
			})
			.catch((err) => {
				next(err);
			});
	});
});

/**
 * @swagger
 * /api/accounts/withdrawals:
 *   get:
 *     summary: "Retrieve total withdrawal amount for a user"
 *     description: "Fetches the total amount withdrawn from the user's account."
 *     tags:
 *       - "Accounts"
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: "The ID of the user whose withdrawal total is to be retrieved."
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: "Total withdrawal amount retrieved successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_withdrawal:
 *                   type: number
 *                   format: float
 *                   example: 5000.00
 *                   description: "Total withdrawal amount for the user."
 *       400:
 *         description: "Bad Request - Missing or invalid user ID."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User Id is required"
 *       404:
 *         description: "Not Found - Account not found for the provided user ID."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account not found"
 *       500:
 *         description: "Internal Server Error - Unexpected error occurred."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get("/withdrawals", (req, res, next) => {
	const userId = req.query.id;
	if (!userId) {
		return res.status(400).json({ message: "User Id is required" });
	}

	Account.findOne({ where: { user_id: userId } }).then((account) => {
		if (!account) {
			return res.status(404).json({ message: "Account not found" });
		}
		History.sum("amount", {
			where: { account_id: account.account_id, transaction_type: "출금" },
		})
			.then((total_withdrawal) => {
				res.json({ total_withdrawal }); // 출금 기록만 반환
			})
			.catch((err) => {
				next(err);
			});
	});
});

router.post("/:childId", async (req, res, next) => {
	// console.log("request", req);
	// console.log("req body", req.body);
	const parentId = 1;
	const { childId } = req.params;

	const temp = req.body;
	console.log(temp);

	const parentAccount = await Account.findOne({ where: { user_id: parentId } });
	const childAccount = await Account.findOne({ where: { user_id: childId } });

	const [inputAmount, outputAmount] = await Promise.all([
		History.sum("amount", {
			where: { account_id: parentAccount.account_id, transaction_type: "입금" },
		}),
		History.sum("amount", {
			where: { account_id: parentAccount.account_id, transaction_type: "출금" },
		}),
	]);
	const balance = inputAmount - outputAmount;

	if (balance < temp.from.amount) {
		// ("잔액이 부족합니다", 400);
		res.status(404).json({ message: "돈없음" });
	}

	const iso = new Date();
	const dateTemp = iso.toISOString();
	const date = dateTemp.substring(0, 10); // "2024-11-21"
	const time = dateTemp.substring(11, 19);
	console.log("날짜", date);
	const from = {
		account_id: parentAccount.account_id,
		bank: PARENT_BANK,
		transaction_type: "출금",
		account_holder: temp.from.account_holder,
		account_number: childAccount.account_number || "계좌번호",
		amount: temp.from.amount,
		date: date,
		time: time,
	};
	const to = {
		account_id: childAccount.account_id,
		bank: CHILD_BANK,
		transaction_type: "입금",
		account_holder: temp.to.account_holder,
		account_number: parentAccount.account_number || "계좌번호",
		amount: temp.to.amount,
		date: date,
		time: time,
	};
	console.log(from, to);
	const histories = await History.bulkCreate([from, to]);
	// 여기는 통합 계좌 내역에  추가된 것 (고정+자유 총 금액 입금 내역(자식에게 뜨는)) + (총 송금 내역(부모에게 뜨는))

	// const subAccounts = [
	//   {sub_account_id: 1, sub_account_usage: "자유", account_id: 1},
	//   {sub_account_id: 2, sub_account_usage: "잉여", account_id: 1},
	//   {sub_account_id: 3, sub_account_usage: "고정", account_id: 1}
	// ];

	//특정아이의 세부계좌
	const subAccounts = await SubAccount.findAll({
		where: { account_id: childAccount.account_id },
	});
	const acc = subAccounts.find((e) => e.sub_account_usage === "고정");
	//자유 세부계좌 id 구함
	const free = subAccounts.find((e) => e.sub_account_usage === "자유");
	// const acc = subAccounts.map((e,i) =>{
	//   if (e.sub_account_usage === "고정")
	//     return e
	// })
	// console.log(acc)

	//subAccounts[0]이게 고정인지 자유인지 어케아냐
	// 바디값의 reservation객체를
	// const sub = temp.reservations.map((e) => {
	// 	return { ...e, sub_account_id: acc.sub_account_id };
	// });

	// 예약 송금 변수를 미리 정의
	let sub = [];

	// 예약 송금이 추가된 경우에만 처리
	if (
		temp &&
		temp.reservations &&
		Array.isArray(temp.reservations) &&
		temp.reservations.length > 0
	) {
		sub = temp.reservations.map((e) => {
			return { ...e, sub_account_id: acc.sub_account_id };
		});

		// 예약 송금 추가
		await ScheduledTransfer.bulkCreate([...sub]);

		//고정비용 추가 된 것 + 자유 비용 추가된 것

		// 예약 송금 정보를 바탕으로 고정 지출 입금내역 + 자유 자금 입금내역 구분하여 각각 추가
		// 고정 비용 총합 / to 의 amount 에서 고정비용 뺸 값
		const fixAmount = temp.reservations.reduce(
			(acc, reservation) => acc + reservation.amount,
			0,
		);

		const freeAmount = temp.from.amount - fixAmount;
		// console.log(fixAmount, freeAmount);
		const fixsubhistory = {
			sub_account_id: acc.sub_account_id,
			bank: CHILD_BANK,
			transaction_type: "입금",
			account_holder: temp.to.account_holder,
			account_number: parentAccount.account_number || "계좌번호",
			amount: fixAmount,
			date: date,
			time: time,
		};

		const freesubhistory = {
			sub_account_id: free.sub_account_id,
			bank: CHILD_BANK,
			transaction_type: "입금",
			account_holder: temp.to.account_holder,
			account_number: parentAccount.account_number || "계좌번호",
			amount: freeAmount,
			date: date,
			time: time,
		};

		const subhistories = await SubAccountHistory.bulkCreate([
			fixsubhistory,
			freesubhistory,
		]);
	} else {
		const freehistory = {
			sub_account_id: free.sub_account_id,
			bank: CHILD_BANK,
			transaction_type: "입금",
			account_holder: temp.to.account_holder,
			account_number: parentAccount.account_number || "계좌번호",
			amount: temp.to.amount,
			date: date,
			time: time,
		};
		const sub = SubAccountHistory.bulkCreate([freehistory]);
		console.log("생성", sub);
	}
	res.json({ code: 200, message: "용돈 송금 완료" });

	// //세부계좌내역
	// const subAccountHistorys = await SubAccountHistory.findAll({where: {sub_account_id: childAccount.sub_account_id}})

	// //추가되어야할것: sub_history_id, createDate, bank, account_number
	// const subhis = temp.reservation.map ((e)=>{
	//   return { ...temp.to, sub_history_id:  }
	// })
});
/**
 * @swagger
 * /api/accounts/number:
 *   get:
 *     tags:
 *       - Accounts
 *     summary: Get Account Number
 *     description: This endpoint retrieves the account number for a user by their ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to find the associated account number.
 *     responses:
 *       200:
 *         description: The account number for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 account_number:
 *                   type: string
 *                   description: The account number associated with the user.
 *       400:
 *         description: Bad Request - If the user ID is not provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal Server Error - If an error occurs while querying the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 */
router.get("/number", (req, res, next) => {
	const userId = req.query.id;

	if (!userId) {
		return res.status(400).json({ message: "User Id is required" });
	}
	Account.findOne({ where: { user_id: userId } })
		.then((account) => {
			res.json({
				account_number: account.account_number,
			});
		})
		.catch((err) => {
			next(err);
		});
});

module.exports = router;
