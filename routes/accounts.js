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
const account = require("../models/account");
const { PARENT_BANK, CHILD_BANK } = require("../util/account_const");
const { default: CustomError } = require("../errors/customError");

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

// 용돈 주기 (송금) 부모 계좌의 잔액에서도 빼야하고
// 자녀 계좌의 잔액에는 더해줘야
// subaccount랑 subaccount history는 추가해야하고
// 부모 계좌의 잔액에서도 빼야하고
// 자녀 계좌의 잔액에는 더해줘야하는데
// account랑 subaccount에 다 들어가야하고
// history도 subaccounthistory도 다 기록되어야함...
// 부모 id랑 자녀 id
// 이걸 이용해서
// accounthistory에는 각각 출금 / 입금 총액
// subaccounthistory에 고정/자유 각각 입금
router.post("/:childId", async (req, res, next) => {
	// console.log("request", req);
	// console.log("req body", req.body);
	const parentId = 1;
	const { childId } = req.params;

	const temp = req.body;

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
	//전체에 하나씩 추가 /스프레드연산자
	// 바디값의 reservation객체를
	const sub = temp.reservations.map((e) => {
		return { ...e, sub_account_id: acc.sub_account_id };
	});

	// 예약 송금 추가
	// await ScheduledTransfer.bulkCreate([...sub]);

	//-------------- 여기까지 완료 ---------- // 이 밑에 subaccounthistory에 고정비용 추가 된 것 + 자유 비용 추가된 것 구현 필요

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

	// //세부계좌내역
	// const subAccountHistorys = await SubAccountHistory.findAll({where: {sub_account_id: childAccount.sub_account_id}})

	// //추가되어야할것: sub_history_id, createDate, bank, account_number
	// const subhis = temp.reservation.map ((e)=>{
	//   return { ...temp.to, sub_history_id:  }
	// })
});

module.exports = router;
