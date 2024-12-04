const express = require("express");
const router = express.Router();
const { ChildRegNoti, Noti } = require("../models");

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: 모든 알림 조회
 *     description: Retrieve all notifications with their details
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "알림을 성공적으로 불러왔습니다."
 *                 response:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       notification_id:
 *                         type: integer
 *                         example: 1
 *                       type:
 *                         type: string
 *                         example: "message"
 *                       isread:
 *                         type: boolean
 *                         example: false
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       amount:
 *                         type: integer
 *                         example: 1000
 *                       content:
 *                         type: string
 *                         example: "새로운 알림이 도착했습니다."
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-04T10:30:00Z"
 *                       sender_id:
 *                         type: integer
 *                         example: 1
 *                       receiver_id:
 *                         type: integer
 *                         example: 2
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 */
router.get("/", async (req, res) => {
	try {
		const response = await Noti.findAll({
			attributes: [
				"notification_id",
				"type",
				"isread",
				"status",
				"amount",
				"content",
				"created_at",
				"sender_id",
				"receiver_id",
			],
		});
		res.status(200).json({
			message: "알림을 성공적으로 불러왔습니다.",
			response: response,
		});
	} catch (error) {
		console.error("알림을 가져오는 중 오류 발생:", error);
		return res.status(500).json({ message: "서버 오류가 발생했습니다." });
	}
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   post:
 *     summary: 새로운 알림 등록
 *     description: Create a new notification with parent ID as sender
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Parent's ID (sender_id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - child_id
 *               - amount
 *               - content
 *             properties:
 *               type:
 *                 type: string
 *                 example: "allowance"
 *                 description: Type of notification
 *               child_id:
 *                 type: integer
 *                 example: 2
 *                 description: ID of the child (receiver_id)
 *               amount:
 *                 type: integer
 *                 example: 10000
 *                 description: Amount related to notification
 *               content:
 *                 type: string
 *                 example: "이번 달 용돈이 지급되었습니다."
 *                 description: Notification content
 *     responses:
 *       200:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "알림이 성공적으로 등록되었습니다."
 *                 response:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: "allowance"
 *                     isread:
 *                       type: boolean
 *                       example: false
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     amount:
 *                       type: integer
 *                       example: 10000
 *                     content:
 *                       type: string
 *                       example: "이번 달 용돈이 지급되었습니다."
 *                     sender_id:
 *                       type: integer
 *                       example: 1
 *                     receiver_id:
 *                       type: integer
 *                       example: 2
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 */
// 알람 등록
router.post("/:id", async (req, res) => {
	const { id } = req.params; // 부모 id.
	const { type, child_id, amount, content } = req.body;

	try {
		const response = await Noti.create({
			type: type,
			isread: false,
			status: "pending",
			amount: amount,
			content: content,
			sender_id: id,
			receiver_id: child_id,
		});
		res.status(200).json({
			message: "알림이 성공적으로 등록되었습니다.",
			response: response,
		});
	} catch (error) {
		console.error("알림을 등록하는 중 오류 발생:", error);
		return res.status(500).json({ message: "서버 오류가 발생했습니다." });
	}
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: 특정 사용자의 알림 목록 조회
 *     description: Retrieve all notifications for a specific user by their ID
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Receiver's user ID
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   notification_id:
 *                     type: integer
 *                     example: 1
 *                   receiver_id:
 *                     type: integer
 *                     example: 1
 *                   # Add other ChildRegNoti model properties here
 *       404:
 *         description: No notifications found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "알림 목록이 없습니다."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 */
// 알림 가져오기
router.get("/:id", async (req, res) => {
	const { id } = req.params; // 요청 파라미터에서 userid 받기

	try {
		// 알림 목록 조회
		const notifications = await ChildRegNoti.findAll({
			where: { receiver_id: id }, // 해당 id에 맞는 알림 목록
		});

		if (notifications.length > 0) {
			// 신청 목록이 있으면 반환
			return res.status(200).json(notifications);
		} else {
			// 신청 목록이 없으면 안내 메시지 반환
			return res.status(404).json({ message: "알림 목록이 없습니다." });
		}
	} catch (error) {
		console.error("알림을 가져오는 중 오류 발생:", error);
		return res.status(500).json({ message: "서버 오류가 발생했습니다." });
	}
});
/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: 알림 상태 업데이트
 *     description: Update notification status to 'done' and mark as read
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the notification to update
 *     responses:
 *       200:
 *         description: Successfully updated notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "알림이 성공적으로 수정되었습니다."
 *                 response:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [1]
 *                   description: Array containing number of affected rows
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 */
router.put("/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const response = await Noti.update(
			{
				status: "done",
				isread: true,
			},
			{
				where: { notification_id: id }, // 조건 객체로 감싸기
			},
		);

		return res.status(200).json({
			message: "알림이 성공적으로 수정되었습니다.",
			response: response,
		});
	} catch (error) {
		console.error("알림을 수정하는 중 오류 발생:", error);
		return res.status(500).json({ message: "서버 오류가 발생했습니다." });
	}
});
module.exports = router;
