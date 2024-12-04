const express = require("express");
const router = express.Router();
const { History } = require("../models");
const { where } = require("sequelize");
const upload = require("../config/multer");
/**
 * @swagger
 * /api/histories:
 *   get:
 *     summary: 히스토리 조회
 *     description: Retrieve history information by ID
 *     tags:
 *       - Histories
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 60
 *         description: ID of the history to retrieve
 *     responses:
 *       200:
 *         description: The history information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history_id:
 *                   type: integer
 *                   example: 60
 *       400:
 *         description: Invalid request - Missing history ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "History ID is required"
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
router.get("/", (req, res, next) => {
	const historyId = req.query.id;
	if (!historyId) {
		return res.status(400).json({ message: "History ID is required" });
	}
	console.log(historyId);
	History.findOne({ where: { history_id: historyId } })
		.then((history) => {
			return res.json(history);
		})
		.catch((err) => {
			next(err);
		});
});
/**
 * @swagger
 * /api/histories/img:
 *   post:
 *     summary: 이미지 업로드
 *     description: Upload a single image file to S3
 *     tags:
 *       - Histories
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "File upload successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       example: "https://s3-bucket-name.s3.region.amazonaws.com/path/to/image.jpg"
 *                     imageKey:
 *                       type: string
 *                       example: "path/to/image.jpg"
 *       500:
 *         description: Failed to upload file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to upload file"
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */
router.post("/img/", upload.single("image"), (req, res, next) => {
	try {
		const images = req.file;
		//s3 키 , url
		const imageKey = images.key;
		const imageUrl = images.location;

		//response
		res.status(200).json({
			success: true,
			message: "File uplaod successfully",
			data: {
				imageUrl,
				imageKey,
			},
		});
	} catch (error) {
		console.error("File uplaod error", error);
		res.status(500).json({
			success: false,
			message: "Failed to uplaod file",
			error: error.message,
		});
	}
});
/**
 * @swagger
 * /api/histories/{id}:
 *   put:
 *     summary: 히스토리 사진 URL 업데이트
 *     description: Update the photo URL for a specific history record
 *     tags:
 *       - Histories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the history record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imgUrl
 *             properties:
 *               imgUrl:
 *                 type: string
 *                 example: "https://example.com/photo.jpg"
 *                 description: New photo URL to update
 *     responses:
 *       200:
 *         description: Photo URL updated or already up to date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Photo URL updated successfully"
 *       404:
 *         description: History record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Record not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error updating photo URL"
 */
//사진 업데이트
router.put("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { imgUrl } = req.body;
		console.log(id, imgUrl);

		const history = await History.findOne({ where: { history_id: id } });

		// 데이터가 없으면 404 반환
		if (!history) {
			return res.status(404).json({ message: "Record not found" });
		}

		// 기존 값과 imgUrl 값이 다를 경우에만 업데이트 진행
		if (history.photo !== imgUrl) {
			const [affectedCount] = await History.update(
				{ photo: imgUrl }, // 업데이트할 값
				{ where: { history_id: id } }, // 조건
			);

			console.log("Affected rows:", affectedCount); // 확인

			if (affectedCount === 0) {
				console.error("No rows updated");
				return res.status(404).json({ message: "No record found to update" });
			} else {
				console.log("Photo URL updated successfully");
				return res
					.status(200)
					.json({ message: "Photo URL updated successfully" });
			}
		} else {
			console.log("The photo URL is the same, no update required.");
			return res
				.status(200)
				.json({ message: "Photo URL is already up to date." });
		}
	} catch (error) {
		console.error("Error updating photo URL:", error);
	}
});

module.exports = router;
