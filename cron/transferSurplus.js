const cron = require("node-cron");
const { User } = require("../models");
const { where } = require("sequelize");
const { transferToFreeAmount } = require("./transferService");

// CRON 작업 정의 및 실행
const scheduleCronJob = (cronTime = "0 0 0 1 * *") => {
	console.log(User);
	cron.schedule(
		cronTime, // 매월 1일 0시 0분
		async () => {
			console.log("Cron Job Started: Moving Fixed to Free Amount");

			try {
				const users = await User.findAll({
					where: { role: "child" }, // user_role이 "child"인 사용자만 가져오기
				}); // 모든 사용자 가져오기
				// console.log(users);
				for (const user of users) {
					const userId = user.user_id;
					// const amount = await calculateSurplusAmount(userId); // 이동할 금액 계산 함수 호출
					await transferToFreeAmount(userId);
					console.log(`Transferred for user ${userId}`);
				}
			} catch (error) {
				console.error(`Cron Job Failed for user :`, error.message);
			}
		},
		{
			timezone: "Asia/Seoul", // 한국 시간대
		},
	);

	console.log("Cron Job Scheduled for the 1st day of every month");
};

module.exports = scheduleCronJob;
