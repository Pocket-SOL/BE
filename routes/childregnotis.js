const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { ChildRegNoti } = require("../models");

/**
 * @swagger
 * /api/childregnotis/registration:
 *   post:
 *     summary: 자녀 등록 알림 생성
 *     description: 부모가 자녀를 선택하여 자녀 등록 알림을 생성합니다.
 *     tags:
 *       - Child Registration Notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sender_id:
 *                 type: integer
 *                 description: 알림을 보낸 사용자의 ID (부모)
 *                 example: 1
 *               receiver_id:
 *                 type: integer
 *                 description: 알림을 받을 사용자의 ID (자녀)
 *                 example: 2
 *     responses:
 *       201:
 *         description: 자녀 등록 알림이 성공적으로 생성되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 자녀 등록 알림이 성공적으로 생성되었습니다.
 *                 notification:
 *                   type: object
 *                   properties:
 *                     notification_id:
 *                       type: integer
 *                       description: 생성된 알림의 고유 ID
 *                       example: 100
 *                     sender_id:
 *                       type: integer
 *                       description: 알림을 보낸 사용자의 ID
 *                       example: 1
 *                     receiver_id:
 *                       type: integer
 *                       description: 알림을 받을 사용자의 ID
 *                       example: 2
 *                     type:
 *                       type: string
 *                       description: 알림 유형
 *                       example: child_registration
 *                     status:
 *                       type: string
 *                       description: 알림 상태
 *                       example: Pending
 *                     is_read:
 *                       type: boolean
 *                       description: 알림 읽음 여부
 *                       example: false
 *       400:
 *         description: 필수 데이터가 누락되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: sender_id와 receiver_id는 필수입니다.
 *       500:
 *         description: 서버 오류로 인해 알림 생성에 실패했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 알림 생성 중 오류가 발생했습니다.
 *                 error:
 *                   type: string
 */
// 자녀 등록
router.post("/registration", async (req, res) => {
	try {
		const { sender_id, receiver_id } = req.body;

		// 데이터 검증
		if (!sender_id || !receiver_id) {
			return res
				.status(400)
				.json({ message: "sender_id와 receiver_id는 필수입니다." });
		}

		// 부모(보내는 사람)의 정보 조회
		const sender = await User.findOne({ where: { user_id: sender_id } });

		// 부모가 존재하는지 확인
		if (!sender) {
			return res
				.status(404)
				.json({ message: "부모 정보가 존재하지 않습니다." });
		}

		// 자녀(받는 사람)의 정보 조회
		const receiver = await User.findOne({ where: { user_id: receiver_id } });

		// 자녀가 존재하는지 확인
		if (!receiver) {
			return res
				.status(404)
				.json({ message: "자녀 정보가 존재하지 않습니다." });
		}

		// // 자녀의 parent_id 필드 업데이트 (부모의 user_id를 자녀의 parent_id로 설정)
		// receiver.parent_id = sender.user_id;
		// await receiver.save(); // 자녀 정보 저장

		// 새로운 알림 생성
		const newNotification = await ChildRegNoti.create({
			sender_id,
			receiver_id,
			type: "child_registration",
			status: "Pending", // 기본 상태 설정
			is_read: false, // 읽지 않은 상태로 설정
		});

		return res.status(201).json({
			message: "자녀 등록 알림이 성공적으로 생성되었습니다.",
			notification: newNotification,
		});
	} catch (error) {
		console.error("Error creating child registration notification:", error);
		return res
			.status(500)
			.json({ message: "알림 생성 중 오류가 발생했습니다.", error });
	}
});

router.put("/registration", async (req, res) => {
	try {
		const { sender_id, receiver_id } = req.body;

		// 데이터 검증
		if (!sender_id || !receiver_id) {
			return res
				.status(400)
				.json({ message: "sender_id와 receiver_id는 필수입니다." });
		}

		// 부모(보내는 사람)의 정보 조회
		const sender = await User.findOne({ where: { user_id: sender_id } });

		// 부모가 존재하는지 확인
		if (!sender) {
			return res
				.status(404)
				.json({ message: "부모 정보가 존재하지 않습니다." });
		}

		// 자녀(받는 사람)의 정보 조회
		const receiver = await User.findOne({ where: { user_id: receiver_id } });

		// 자녀가 존재하는지 확인
		if (!receiver) {
			return res
				.status(404)
				.json({ message: "자녀 정보가 존재하지 않습니다." });
		}

		// 자녀의 parent_id 필드 업데이트 (부모의 user_id를 자녀의 parent_id로 설정)
		receiver.parent_id = sender.user_id;
		await receiver.save(); // 자녀 정보 저장

		// 새로운 알림 생성
		const newNotification = await ChildRegNoti.update(
			{
				status: "done",
				is_read: true,
			},
			{
				where: {
					sender_id: sender_id,
					receiver_id: receiver_id,
				},
			},
		);

		return res.status(201).json({
			message: "자녀 등록 알림이 성공적으로 생성되었습니다.",
			notification: newNotification,
		});
	} catch (error) {
		console.error("Error creating child registration notification:", error);
		return res
			.status(500)
			.json({ message: "알림 생성 중 오류가 발생했습니다.", error });
	}
});

module.exports = router;
