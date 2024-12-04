const {
	SubAccount,
	SubAccountHistory,
	Account,
	sequelize,
	Sequelize,
} = require("../models");

const transferToFreeAmount = async (id) => {
	const now = new Date();

	const currentDate = now.toISOString().split("T")[0]; // '2024-12-04'
	const currentTime = now.toISOString().split("T")[1].split(".")[0];
	await sequelize.transaction(async (t) => {
		// 1. 사용자 조회
		const acc = await Account.findOne({
			where: { user_id: id },
			transaction: t,
		});
		if (!acc) {
			throw new Error("account not found");
		}
		// 2. 자유 세부계좌와 잉여 세부계좌 조회
		const freeAccount = await SubAccount.findOne({
			where: { account_id: acc.account_id, sub_account_usage: "자유" },
			transaction: t,
		});
		if (!freeAccount) {
			throw new Error("Fixed subaccount not found");
		}
		const wishAccount = await SubAccount.findOne({
			where: { account_id: acc.account_id, sub_account_usage: "잉여" },
			transaction: t,
		});
		if (!wishAccount) {
			throw new Error("Free subaccount not found");
		}

		// 3. 의 현재 잔액 조회
		const freeBalanceResult = await SubAccountHistory.findOne({
			where: { sub_account_id: freeAccount.sub_account_id },
			attributes: [
				[
					Sequelize.literal(
						'SUM(CASE WHEN transaction_type = "입금" THEN amount ELSE 0 END) - SUM(CASE WHEN transaction_type = "출금" THEN amount ELSE 0 END)',
					),
					"balance",
				],
			],
			transaction: t,
		});

		const freeBalance = freeBalanceResult?.dataValues?.balance || 0;
		if (Number(freeBalance) === 0)
			return { message: "자유 세부계좌에 이체할 잔액이 없습니다." };

		// 4. 자유 계좌에서 금액 차감
		await SubAccountHistory.create(
			{
				sub_account_id: freeAccount.sub_account_id,
				transaction_type: "출금",
				amount: freeBalance,
				account_holder: "잔액이전",
				time: currentTime,
				date: currentDate,
				account_number: "내계좌",
			},
			{ transaction: t },
		);

		// 5. 잉여 계좌에 금액 추가
		await SubAccountHistory.create(
			{
				sub_account_id: wishAccount.sub_account_id,
				transaction_type: "입금",
				amount: freeBalance,
				account_holder: "잔액이전",
				time: currentTime,
				date: currentDate,
				account_number: "내계좌",
			},
			{ transaction: t },
		);
	});
	return { message: "Transfer successful" };
};
module.exports = { transferToFreeAmount };
