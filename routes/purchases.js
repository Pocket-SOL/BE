const express = require("express");
const router = express.Router();
const { Purchase, Purchaseuser } = require("../models");
const userAuth = require("../middlewares/userAuth");
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
		const { title, content, end_date, participants, amount } = req.body;
		console.log(req.body);
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
	const { title, content, end_date, participants, amount } = req.body;
	const id = req.params.id;
	const modified = await Purchase.update(
		{
			title: title,
			content: content,
			end_date: end_date,
			participants: participants,
			amount: amount,
		},
		{ where: { purchase_id: id } },
	);
	res.json({ ok: true, response: modified });
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
		const id = req.params.id;
		const deleted = await Purchase.destroy({
			where: { purchase_id: id },
		});

		if (deleted) {
			res.json({ ok: true, response: deleted });
		} else {
			res.status(404).json({ ok: false, error: "구매를 찾을 수 없습니다." });
		}
	} catch (error) {
		res.status(500).json({ ok: false, error: error.message });
	}
});

module.exports = router;
