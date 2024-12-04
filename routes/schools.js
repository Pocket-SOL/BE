const express = require("express");
const { User } = require("../models");
const router = express.Router();
const upload = require("../config/multer");
const axios = require("axios");
/**
 * @swagger
 * /api/schools:
 *   get:
 *     summary: 서울시 중학교 목록 조회
 *     description: |
 *       서울시 교육청 Open API를 사용하여 중학교 목록을 조회합니다.
 *
 *       External API:
 *       - URL: http://openapi.seoul.go.kr:8088/{apiKey}/json/neisSchoolInfoMS/1/1000/
 *       - Provider: 서울특별시 교육청
 *       - 한 번에 최대 1000개의 학교 정보를 조회합니다.
 *       - API 키는 환경 변수로 관리됩니다.
 *     tags:
 *       - Schools
 *     responses:
 *       200:
 *         description: Successfully retrieved school list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["서울중학교", "한강중학교", "강남중학교"]
 *       500:
 *         description: Failed to fetch data from external API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch school data"
 */
router.get("/", async (req, res) => {
	const apiKey = process.env.SCHOOL_KEY;
	const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/neisSchoolInfoMS/1/1000/`;
	try {
		const response = await axios.get(url);
		console.log(response.data);
		const data = response.data.neisSchoolInfoMS.row;
		const schoolData = data.map((school) => school.SCHUL_NM);
		console.log(schoolData);
		res.send(schoolData);
	} catch (error) {
		console.error("Error fetching school data:", error);
		res.status(500).json({ error: "Failed to fetch school data" });
	}
});
/**
 * @swagger
 * /api/schools/img:
 *   post:
 *     summary: S3 이미지 업로드
 *     description: |
 *       이미지 파일을 AWS S3에 업로드합니다.
 *       - 지원 형식: jpg, jpeg, png
 *       - 최대 파일 크기: 5MB
 *     tags:
 *       - Schools
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
 *         description: Successfully uploaded file to S3
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
 *                       example: "https://your-bucket.s3.region.amazonaws.com/path/to/image.jpg"
 *                       description: S3 URL of the uploaded image
 *                     imageKey:
 *                       type: string
 *                       example: "path/to/image.jpg"
 *                       description: S3 key of the uploaded image
 *       400:
 *         description: Invalid file format or size
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
 *                   example: "Invalid file format. Only jpg, jpeg, png allowed"
 *       500:
 *         description: Upload failed
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
 *                   example: "S3 upload error message"
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
 * /api/schools/{id}:
 *   put:
 *     summary: 사용자 학교 인증 사진 업데이트
 *     description: Update user's school authentication photo URL
 *     tags:
 *       - Schools
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the user to update
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
 *                 example: "https://example.com/school-auth.jpg"
 *                 description: New school authentication photo URL
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
 *         description: User not found or update failed
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
	console.log(req.params);
	try {
		const user_id = req.params.id;
		const { imgUrl } = req.body;
		const user = await User.findOne({ where: { user_id: user_id } });

		// 데이터가 없으면 404 반환
		if (!user) {
			return res.status(404).json({ message: "Record not found" });
		}

		// 기존 값과 imgUrl 값이 다를 경우에만 업데이트 진행
		if (user.school_auth !== imgUrl) {
			const [affectedCount] = await User.update(
				{ school_auth: imgUrl }, // 업데이트할 값
				{ where: { user_id: user_id } }, // 조건
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
