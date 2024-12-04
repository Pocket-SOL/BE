const {
	SubAccount,
	SubAccountHistory,
	Account,
	sequelize,
	Sequelize,
	ScheduledTransfer,
	User,
	History,
} = require("../models");

const transferToFreeAmount = async (id) => {
	const now = new Date();

	const currentDate = now.toISOString().split("T")[0];
	const currentTime = now.toISOString().split("T")[1].split(".")[0];
	const time = now.toLocaleTimeString({
		timeZone: "Asia/Seoul",
		hour12: false,
	});
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

const executeScheduledTransfer = async () => {
	const now = new Date();
	const nmonth = String(now.getMonth() + 1).padStart(2, "0");
	const nday = String(now.getDate()).padStart(2, "0");

	// 형식에 맞춰 현재 날짜 생성
	const date = `${now.getFullYear()}-${nmonth}-${nday}`;
	const currentTime = now.toISOString().split("T")[1].split(".")[0];
	try {
		// 오늘 날짜의 예약 송금 목록 조회
		const transfers = await ScheduledTransfer.findAll({
			where: Sequelize.where(
				Sequelize.fn(
					"DATE_FORMAT",
					Sequelize.col("scheduled_date"),
					"%Y-%m-%d",
				),
				date,
			),
		});

		if (transfers.length === 0) {
			console.log("오늘 처리할 예약 송금 내역이 없습니다.");
			return;
		}

		// 예약 송금 처리
		for (const transfer of transfers) {
			const t = await sequelize.transaction();

			try {
				// 1. 송금할 계좌 조회
				const fixedAccount = await SubAccount.findOne({
					where: {
						sub_account_id: transfer.sub_account_id,
						sub_account_usage: "고정",
					},
					transaction: t,
				});

				if (!fixedAccount) {
					throw new Error("출금 계좌를 찾을 수 없습니다.");
				}

				const user = await User.findOne({
					where: { user_id: fixedAccount.account_id },
					transaction: t,
				});
				// 없으면 시스템에 등록 안 된 계좌
				const targetAccount = await Account.findOne({
					where: { account_number: transfer.account_number },
					transaction: t,
				});

				// 2. 출금 계좌 잔액 확인
				const fixedBalanceResult = await SubAccountHistory.findOne({
					where: { sub_account_id: fixedAccount.sub_account_id },
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

				const fixedBalance = fixedBalanceResult?.dataValues?.balance || 0;
				if (Number(fixedBalance) < Number(transfer.amount)) {
					throw new Error("잔액이 부족합니다.");
				}

				// 3. 계좌 & 고정 계좌에서 금액 차감
				const his = await History.create({
					date: date,
					time: currentTime,
					transaction_type: "출금",
					account_holder: transfer.account_holder,
					account_number: transfer.account_number,
					amount: transfer.amount,
					account_id: fixedAccount.account_id,
				});
				if (!his) {
					throw new Error("history can't create");
				}
				await SubAccountHistory.create(
					{
						sub_account_id: fixedAccount.sub_account_id,
						transaction_type: "출금",
						amount: transfer.amount,
						account_holder: transfer.account_holder,
						date: date,
						time: currentTime,
						account_number: transfer.account_number,
					},
					{ transaction: t },
				);
				// 4. 대상 계좌 있으면 금액 추가
				if (targetAccount)
					await History.create(
						{
							account_id: targetAccount.account_id,
							transaction_type: "입금",
							amount: transfer.amount,
							account_holder: user.username,
							time: currentTime,
							date: date,
							account_number: fixedAccount.account_num,
						},
						{ transaction: t },
					);
				// 완료된 송금 제거
				await ScheduledTransfer.destroy({
					where: { scheduled_id: transfer.scheduled_id },
					transaction: t,
				});
				// 5. 트랜잭션 커밋
				await t.commit();
				console.log(`예약 송금 처리 완료: ${transfer.scheduled_id}`);
			} catch (error) {
				// 트랜잭션 롤백
				await t.rollback();
				console.error(`예약 송금 처리 실패: ${transfer.scheduled_id}`, error);
			}
		}
	} catch (error) {
		console.error("예약 송금 처리 중 오류 발생:", error);
	}
};
module.exports = { transferToFreeAmount, executeScheduledTransfer };
