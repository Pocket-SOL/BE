const express = require("express");
const router = express.Router();

const { Comment } = require("../models");

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

router.post("/:purchaseid", async (req, res) => {
	try {
		const PurchaseId = req.params.id;
		const { user_id, content } = req.body;
		const comment = await Comment.create({
			purchase_id: PurchaseId,
			user_id,
			content,
		});
		res.json({ ok: true, response: comment });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// 사용자 인증 api 만들어지면 하기.
// router.put("/:id", async (req, res) => {
// 	try {
// 		const commentId = req.params.id;

// 		const modified = await Comment.update({});
// 	} catch (error) {
// 		res.status(500).json({ error: error.message });
// 	}
// });
module.exports = router;
