const express = require("express");
const router = express.Router();

const { Comment, Purchase, Noti, User } = require("../models");
const { default: userAuth } = require("../middlewares/userAuth");
const user = require("../models/user");
const { userSocketMap } = require("../server"); // server.js에서 userSocketMap을 가져옴
const { io } = require("../server"); // 소켓 서버

// const userSocketMap = {};

/**
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     summary: 특정 게시글 댓글 조회
 *     description: Fetch all comments associated with a specific purchase by its ID.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the purchase to retrieve comments for.
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   purchase_id:
 *                     type: integer
 *                     example: 1
 *                   content:
 *                     type: string
 *                     example: "This is a sample comment."
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-11-22T12:34:56.000Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-11-22T12:34:56.000Z"
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
	try {
		const PurchaseId = req.params.id;
		const comment = await Comment.findAll({
			where: { purchase_id: PurchaseId },
		});
		res.json({ ok: true, response: comment });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * @swagger
 * /api/comments/{id}:
 *   post:
 *     summary: 특정 게시글에 댓글 작성
 *     description: Add a new comment associated with a specific purchase by its ID.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the purchase to add a comment for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the user posting the comment.
 *               content:
 *                 type: string
 *                 example: "This is a new comment."
 *                 description: The content of the comment.
 *     responses:
 *       201:
 *         description: The created comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     purchase_id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     content:
 *                       type: string
 *                       example: "This is a new comment."
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-22T12:34:56.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-22T12:34:56.000Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid input data"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post("/:id", async (req, res) => {
	try {
		const PurchaseId = req.params.id;
		const { user_id, username, content } = req.body;
		// 댓글 작성.
		const comment = await Comment.create({
			user_id: user_id,
			purchase_id: PurchaseId,
			username,
			content,
		});
		console.log("comment완료");
		// 댓글이 달린 게시글의 작성자 확인
		const purchase = await Purchase.findOne({
			where: { purchase_id: PurchaseId },
		});
		console.log("purchase", purchase.username);
		if (purchase && purchase.username) {
			const recipientUsername = purchase.user_id; // 게시글 작성자
			const senderId = user_id; // 댓글 작성자
			const receiverId = recipientUsername; // 알림 받을 사용자

			const comment = {
				type: "COMMENT", // 알림 유형: 댓글
				content: `새로운 댓글이 달렸습니다: "${content}"`,
				sender_id: senderId,
				receiver_id: receiverId,
				isread: false, // 읽지 않은 상태 0저장
			};

			// 알림 데이터 저장
			const notification = await Noti.create(comment);

			console.log(`Notification created: ${notification.notification_id}`);
			console.log(userSocketMap);
			// if (userSocketMap[recipientUsername]) {
			// 	const recipientSocketId = userSocketMap[recipientUsername];
			// 	io.to(recipientSocketId).emit("notification", {
			// 		type: "COMMENT", // 타입 일치
			// 		content: `새로운 댓글이 달렸습니다: "${content}"`, // 내용 일치
			// 		sender_id: senderId, // sender_id 일치
			// 		receiver_id: receiverId, // receiver_id 일치
			// 		isread: false, // 읽지 않은 상태
			// 	});
			// 	console.log("전달");
			// }
		}
		res.json({ ok: true, response: comment });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: 댓글 수정
 *     description: Update an existing comment by its ID.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the comment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is an updated comment."
 *                 description: The updated content of the comment.
 *     responses:
 *       200:
 *         description: Successfully updated the comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     purchase_id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     content:
 *                       type: string
 *                       example: "This is an updated comment."
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-22T12:34:56.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-23T12:34:56.000Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid input data"
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
	try {
		const comment_id = req.params.id;
		const { content } = req.body;

		const updated = await Comment.update(
			{ content },
			{ where: { comment_id } },
		);

		if (updated[0] === 0) {
			res.status(404).json({ ok: false, error: "댓글을 찾을 수 없습니다." });
		} else {
			const updatedComment = await Comment.findOne({ where: { comment_id } });
			res.json({ ok: true, response: updatedComment });
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: 댓글 삭제
 *     description: Delete an existing comment by its ID.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the comment to delete.
 *     responses:
 *       200:
 *         description: Successfully deleted the comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: integer
 *                   description: Number of deleted rows.
 *                   example: 1
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
	try {
		const comment_id = req.params.id;
		const deleted = await Comment.destroy({
			where: { comment_id },
		});

		if (deleted) {
			res.json({ ok: true, response: deleted });
		} else {
			res.status(404).json({ ok: false, error: "댓글을 찾을 수 없습니다." });
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
