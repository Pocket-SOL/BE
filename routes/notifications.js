const express = require("express");
const router = express.Router();
const { ChildRegNoti } = require("../models");

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: 특정 사용자의 알림 목록 조회
 *     description: 주어진 `id`에 해당하는 사용자의 알림 목록을 조회합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: 알림을 조회할 사용자의 ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 알림 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   notification_id:
 *                     type: string
 *                   receiver_id:
 *                     type: string
 *                   message:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: 알림 목록이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "알림 목록이 없습니다."
 *       500:
 *         description: 서버 오류
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

module.exports = router;
