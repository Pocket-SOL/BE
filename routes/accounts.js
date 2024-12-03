const express = require("express");
const router = express.Router();
const {
	Account,
	User,
	History,
	SubAccount,
	SubAccountHistory,
	ScheduledTransfer,
} = require("../models");
const { where } = require("sequelize");
const { PARENT_BANK, CHILD_BANK } = require("../util/account_const");
const axios = require("axios");

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
//계좌&세부계좌 생성
router.post("/", async (req, res, next) => {
	const userId = req.body.id;
	const num = req.body.num;
	console.log(userId, num);

	try {
		const user = await User.findByPk(userId);
		console.log(user);
		if (!user) {
			return res.status(400).json({
				success: false,
				message: `User with ID ${userId} does not exist.`,
			});
		}
		//계좌 생성
		const account = await Account.create(
			{
				user_id: userId,
				account_num: num,
			},
			{ raw: true },
		);
		let temp_res;
		//부모 초기값 50마넌
		if (user.role === "parent") {
			const currentDateTime = new Date();
			const date = currentDateTime.toISOString().split("T")[0];
			const time = currentDateTime.toISOString().split("T")[1].split(".")[0];
			console.log("account", account);
			const his = await History.create({
				date: date,
				time: time,
				transaction_type: "입금",
				account_holder: "초기자금",
				account_number: account.account_num,
				amount: 500000,
				account_id: account.account_id,
				bank: "신한",
			});
			console.log(his);
			temp_res = his;
		}

		//자녀 세부계좌 생성;
		else {
			const sub = await SubAccount.bulkCreate([
				{ account_id: account.account_id, sub_account_usage: "고정" },
				{ account_id: account.account_id, sub_account_usage: "자유" },
				{ account_id: account.account_id, sub_account_usage: "잉여" },
			]);
			temp_res = sub;
		}
		// console.log(sub);
		res.status(201).json({
			success: true,
			message: "Account & SubAccount created successfully",
			account,
			temp_res,
		});
	} catch (error) {
		console.error(error);
		next(error);
	}
});
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
router.get("/", async (req, res, next) => {
	try {
		const userId = req.query.id;
		console.log(userId);
		if (!userId) {
			return res.status(400).json({ message: "User ID is required" });
		}
		// 계좌 정보 조회
		const account = await Account.findOne({ where: { user_id: userId } });
		if (!account) {
			return res.status(404).json({ message: "Account not found" });
		}

		// 입금 합계 조회
		const inputAmount =
			(await History.sum("amount", {
				where: { account_id: account.account_id, transaction_type: "입금" },
			})) || 0;

		// 출금 합계 조회
		const outputAmount =
			(await History.sum("amount", {
				where: { account_id: account.account_id, transaction_type: "출금" },
			})) || 0;

		// 잔액 계산 및 반환
		const totalAmount = inputAmount - outputAmount;
		res.json({ totalAmount });
	} catch (error) {
		// 에러 처리
		next(error);
	}
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

function generateBankTranId() {
	const uniqueId = Date.now().toString().slice(-9); // 현재 시간에서 마지막 6자리 추출
	return `M202402739U${uniqueId}`; // 고유 ID 생성
}

function generageTrandDtime() {
	const now = new Date(Date.now());
	const tranDtime = now
		.toISOString()
		.replace(/[-T:.Z]/g, "")
		.slice(0, 14);
	return tranDtime;
}

router.get("/balance", async (req, res, next) => {
	try {
		const { id } = req.query;
		if (!id) {
			return res.status(400).json({ error: "Token and user_id are required" });
		}
		const user = await User.findOne({ where: { user_id: id } });
		const acc = await Account.findOne({ where: { user_id: id } });
		if (!acc) {
			return res
				.status(404)
				.json({ error: "Account not found for the given user ID" });
		}
		const bankTranId = generateBankTranId();
		const tranDtime = generageTrandDtime();
		const apiUrl = `https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num?bank_tran_id=${bankTranId}&fintech_use_num=${acc.account_num}&tran_dtime=${tranDtime}`;
		const response = await axios.get(apiUrl, {
			headers: {
				"Content-type": "application/json",
				Authorization: `Bearer ${user.open_token}`,
			},
		});

		if (response?.rsp_code !== "A0002") {
			res.status(500).json({
				error: response?.rsp_message || "Failed to fetch account balance",
			});
		} else {
			res.json(response.data); // 정상 응답 전송
		}
	} catch (error) {
		console.error("Failed to fetch account balance:", error);
	}
});

/**
 * @swagger
 * /api/accounts/{childId}:
 *   post:
 *     tags:
 *       - Accounts
 *     summary: 자녀에게 용돈 송금
 *     description: 부모가 자녀에게 용돈을 송금합니다. 고정비용과 자유금액으로 나누어 송금할 수 있습니다.
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 자녀 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from
 *               - to
 *             properties:
 *               from:
 *                 type: object
 *                 properties:
 *                   transaction_type:
 *                     type: string
 *                     description: 거래 유형
 *                     example: "출금"
 *                   account_holder:
 *                     type: string
 *                     description: 송금자(부모) 이름
 *                     example: "하민지"
 *                   amount:
 *                     type: number
 *                     description: 송금할 금액
 *                     example: 7
 *               to:
 *                 type: object
 *                 properties:
 *                   transaction_type:
 *                     type: string
 *                     description: 거래 유형
 *                     example: "입금"
 *                   account_holder:
 *                     type: string
 *                     description: 수신자(자녀) 이름
 *                     example: "김도은"
 *                   amount:
 *                     type: number
 *                     description: 수신할 금액
 *                     example: 7
 *               reservations:
 *                 type: array
 *                 description: 고정비용 예약 송금 목록 (선택사항)
 *                 items:
 *                   type: object
 *                   properties:
 *                     account_holder:
 *                       type: string
 *                       description: 수취인 이름
 *                       example: "수학학원"
 *                     bank:
 *                       type: string
 *                       description: 은행명
 *                       example: "국민은행"
 *                     account_number:
 *                       type: string
 *                       description: 계좌번호
 *                       example: "1002123012345"
 *                     amount:
 *                       type: number
 *                       description: 예약 송금 금액
 *                       example: 10000
 *                     scheduled_date:
 *                       type: string
 *                       description: 예약 송금 날짜
 *                       example: "2024-12-05"
 *     responses:
 *       200:
 *         description: 송금 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "용돈 송금 완료"
 *       404:
 *         description: 잔액 부족
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "돈없음"
 */

router.post("/:childId", async (req, res, next) => {
	const { childId } = req.params;
	const temp = req.body;
	const parentId = temp.from.parent_id;

	const parentAccount = await Account.findOne({
		where: { user_id: parentId },
	});
	console.log(parentAccount);
	const childAccount = await Account.findOne({ where: { user_id: childId } });
	console.log("c-a", childAccount);
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
		res.status(404).json({ message: "잔액이 부족합니다." });
	}

	const iso = new Date();
	const dateTemp = iso.toISOString();
	const date = dateTemp.substring(0, 10); // "2024-11-21"
	const time = dateTemp.substring(11, 19);
	// console.log("날짜", date);
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
				account_number: account.account_num,
			});
		})
		.catch((err) => {
			next(err);
		});
});

module.exports = router;
