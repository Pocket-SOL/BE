const express = require("express");
const router = express.Router();
const { Purchase, Purchaseuser } = require("../models");
const userAuth = require("../middlewares/userAuth");
const upload = require("../config/multer");

/**
 * @swagger
 * /api/purchases:
 *   get:
 *     summary: 구매 목록 조회
 *     tags: [Purchases]
 *     responses:
 *       200:
 *         description: 구매 목록을 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: 구매 ID
 *                   title:
 *                     type: string
 *                     description: 구매 제목
 *                   content:
 *                     type: string
 *                     description: 구매 내용
 *                   end_date:
 *                     type: string
 *                     format: date
 *                     description: 마감일
 *                   participants:
 *                     type: integer
 *                     description: 참여자 수
 *                   amount:
 *                     type: number
 *                     description: 금액
 *       500:
 *         description: 서버 에러
 */

router.get("/", async (req, res) => {
	try {
		const purchaseList = await Purchase.findAll();

		res.json(purchaseList);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * @swagger
 * /api/purchases/{id}:
 *   get:
 *     summary: 특정 구매 조회
 *     tags: [Purchases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 조회할 구매의 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 구매 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: 구매 ID
 *                 title:
 *                   type: string
 *                   description: 구매 제목
 *                 content:
 *                   type: string
 *                   description: 구매 내용
 *                 end_date:
 *                   type: string
 *                   format: date
 *                   description: 마감일
 *                 participants:
 *                   type: integer
 *                   description: 참여자 수
 *                 amount:
 *                   type: number
 *                   description: 금액
 *       404:
 *         description: 구매를 찾을 수 없음
 *       500:
 *         description: 서버 에러
 */
router.get("/:id", async (req, res) => {
	try {
		const id = req.params.id;
		const purchase = await Purchase.findOne({ where: { purchase_id: id } });
		res.json(purchase);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * @swagger
 * /api/purchases:
 *   post:
 *     summary: 구매 등록
 *     tags: [Purchases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 구매 제목
 *                 example: 새로운 노트북 구매
 *               content:
 *                 type: string
 *                 description: 구매 내용
 *                 example: 팀 프로젝트용 노트북 구매
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: 마감일
 *                 example: 2024-12-31
 *               participants:
 *                 type: integer
 *                 description: 참여자 수
 *                 example: 5
 *               amount:
 *                 type: number
 *                 description: 총 금액
 *                 example: 1500000
 *     responses:
 *       200:
 *         description: 구매가 성공적으로 등록되었습니다.
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
 *                   description: 등록된 구매 정보
 *       500:
 *         description: 서버 에러
 */

router.post("/", userAuth, async (req, res) => {
	try {
		const { title, content, end_date, participants, amount, school } = req.body;
		console.log(req.body);
		console.log(req.user_id);
		const userId = req.user_id; // 미들웨어에서 설정한 사용자 ID 사용
		const userName = req.user_username;
		console.log("purchase", userId, userName);
		const purchaseRegister = await Purchase.create({
			title,
			status: "ongoing", // 생성 시 기본 상태 '진행중'
			content,
			end_date,
			user_id: userId, // 사용자를 구별하기 위해 추가
			username: userName,
			participants,
			amount,
			count: 0,
			school: school,
		});
		res.json({ ok: true, response: purchaseRegister });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});
/**
 * @swagger
 * /api/purchases/{id}:
 *   put:
 *     summary: 구매 정보 수정
 *     tags: [Purchases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 수정할 구매의 ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 구매 제목
 *               content:
 *                 type: string
 *                 description: 구매 내용
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: 마감일
 *               participants:
 *                 type: integer
 *                 description: 참여자 수
 *               amount:
 *                 type: number
 *                 description: 총 금액
 *     responses:
 *       200:
 *         description: 구매 정보 수정 성공
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
 *                   description: 수정된 구매 정보
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 구매를 찾을 수 없음
 *       500:
 *         description: 서버 에러
 */
router.put("/:id", async (req, res) => {
	const { status } = req.body;
	const purchase_id = req.params.id;
	const modifiedStatus = await Purchase.update(
		{
			status: "end",
		},
		{ where: { purchase_id: purchase_id } },
	);
	res.json({ ok: true, response: modifiedStatus });
});

/**
 * @swagger
 * /api/purchases/{id}:
 *   delete:
 *     summary: 구매 정보 삭제
 *     tags: [Purchases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 삭제할 구매의 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 구매 정보 삭제 성공
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
 *                   description: 삭제된 행 수
 *       404:
 *         description: 구매를 찾을 수 없음
 *       500:
 *         description: 서버 에러
 */

router.delete("/:id", async (req, res) => {
	try {
		const purchase_id = req.params.id;
		const { user_id } = req.body; // 요청에서 user_id 가져옴

		// 삭제하려는 글의 작성자 확인
		const purchase = await Purchase.findOne({ where: { purchase_id } });

		if (!purchase) {
			return res
				.status(404)
				.json({ ok: false, error: "구매를 찾을 수 없습니다." });
		}

		// 작성자와 요청한 사용자가 일치하지 않으면 권한 없음
		if (purchase.user_id !== user_id) {
			return res.status(403).json({
				ok: false,
				error: "삭제 권한이 없습니다.",
			});
		}

		// 삭제 수행
		await Purchase.destroy({ where: { purchase_id } });

		res.json({
			ok: true,
			response: `Purchase ${purchase_id} has been deleted.`,
		});
	} catch (error) {
		res.status(500).json({ ok: false, error: error.message });
	}
});

//purchaseuser 관련

/**
 * @swagger
 * /api/purchases/user/{id}:
 *   post:
 *     summary: 공동구매 참여 신청
 *     description: Register a user for a purchase and update the total participant count
 *     tags:
 *         [Purchases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the user joining the purchase
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - purchase_id
 *             properties:
 *               purchase_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the purchase to join
 *     responses:
 *       200:
 *         description: Successfully registered user to purchase
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
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     purchase_id:
 *                       type: integer
 *                       example: 1
 *                 count:
 *                   type: integer
 *                   example: 5
 *                   description: Updated total number of participants
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post("/user/:id", async (req, res) => {
	console.log(req.body);
	console.log(req.params);
	const { purchase_id } = req.body;
	const user_id = req.params.id;
	try {
		const userRegister = await Purchaseuser.create({
			user_id,
			purchase_id,
		});

		const count = await Purchaseuser.count({
			where: { purchase_id: purchase_id },
		});

		await Purchase.update({ count }, { where: { purchase_id: purchase_id } });
		res.json({ ok: true, response: userRegister, count: count });
	} catch (error) {
		res.status(500).json({ ok: false, error: error.message });
	}
});
/**
 * @swagger
 * /api/purchases/participant/{id}:
 *   get:
 *     summary: 사용자의 참여 공동구매 목록 조회
 *     description: Retrieve all purchase IDs that a user has participated in
 *     tags:
 *        [Purchases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: User ID to get purchase history
 *     responses:
 *       200:
 *         description: Successfully retrieved purchase IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 purchaseIds:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [1, 2, 3]
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.get("/participant/:id", async (req, res) => {
	const user_id = req.params.id;
	try {
		const partarr = await Purchaseuser.findAll({
			where: { user_id: user_id },
			attributes: ["purchase_id"],
		});

		const purchaseIds = partarr.map((el) => el.purchase_id);
		res.json({ ok: true, purchaseIds });
	} catch (error) {
		res.status(500).json({ ok: false, error: error.message });
	}
});
/**
 * @swagger
 * /api/purchases/user/{id}:
 *   get:
 *     summary: 공동구매 참여자 목록 조회
 *     description: Retrieve the list of users and total count of participants for a specific purchase
 *     tags:
 *        [Purchases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Purchase ID to get participant list
 *     responses:
 *       200:
 *         description: Successfully retrieved participant list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                   description: Total number of participants
 *                 userList:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [1, 2, 3]
 *                   description: List of user IDs participating in the purchase
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.get("/user/:id", async (req, res) => {
	const purchase_id = req.params.id;
	try {
		const userList = await Purchaseuser.findAll({
			where: { purchase_id: purchase_id },
			attributes: ["user_id"],
		}).then((users) => {
			return users.map((user) => user.user_id);
		});

		const count = await Purchaseuser.count({
			where: { purchase_id: purchase_id },
		});

		res.json({ ok: true, count: count, userList: userList });
	} catch (error) {
		res.status(500).json({ ok: false, error: error.message });
	}
});
/**
 * @swagger
 * /api/purchases/user/delete/{id}:
 *   post:
 *     summary: 공동구매 참여 취소
 *     description: Remove a user from a purchase and update the total participant count
 *     tags:
 *      [Purchases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: User ID to remove from purchase
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - purchase_id
 *             properties:
 *               purchase_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the purchase to remove user from
 *     responses:
 *       200:
 *         description: Successfully removed user from purchase
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
 *                   example: 1
 *                   description: Number of rows deleted
 *                 count:
 *                   type: integer
 *                   example: 4
 *                   description: Updated total number of participants
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post("/user/delete/:id", async (req, res) => {
	const { purchase_id } = req.body;
	const user_id = req.params.id;
	try {
		const user = await Purchaseuser.destroy({
			where: { purchase_id: purchase_id, user_id: user_id },
		});
		const count = await Purchaseuser.count({
			where: { purchase_id: purchase_id },
		});
		await Purchase.update({ count }, { where: { purchase_id: purchase_id } });
		res.json({ ok: true, response: user, count: count });
	} catch (error) {
		res.status(500).json({ ok: false, error: error.message });
	}
});
/**
 * @swagger
 * /api/purchases/img:
 *   post:
 *     summary: 이미지 업로드
 *     description: Upload an image to S3 and return the URL and key
 *     tags:
 *        [Purchases]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
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
 *                       example: "https://s3-bucket.amazonaws.com/path/to/image.jpg"
 *                     imageKey:
 *                       type: string
 *                       example: "path/to/image.jpg"
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
 *                   example: "Error message details"
 */
// 사진 업로드
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
 * /api/purchases/img/{id}:
 *   put:
 *     summary: 공동구매 이미지 URL 업데이트
 *     description: Update the image URL of a specific purchase
 *     tags:
 *        [Purchases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Purchase ID to update image
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
 *                 example: "https://example.com/new-image.jpg"
 *                 description: New image URL to update
 *     responses:
 *       200:
 *         description: Image URL updated or already up to date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Photo URL updated successfully"
 *       404:
 *         description: Purchase not found
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
router.put("/img/:id", async (req, res) => {
	console.log(req.params);
	try {
		const purchase_id = req.params.id;
		const { imgUrl } = req.body;
		const purchase = await Purchase.findOne({
			where: { purchase_id: purchase_id },
		});

		// 데이터가 없으면 404 반환
		if (!purchase) {
			return res.status(404).json({ message: "Record not found" });
		}

		// 기존 값과 imgUrl 값이 다를 경우에만 업데이트 진행
		if (purchase.image !== imgUrl) {
			const [affectedCount] = await Purchase.update(
				{ image: imgUrl }, // 업데이트할 값
				{ where: { purchase_id: purchase_id } }, // 조건
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
