const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");
const router = express.Router();
const { User } = require("../models");
const { Op } = require("sequelize");
const user = require("../models/user");
dotenv.config();
/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: 회원가입
 *     description: 새로운 사용자를 생성합니다. 사용자의 ID, 비밀번호, 사용자 이름, 생일, 전화번호, 역할을 입력받습니다.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 사용자 ID (영문자와 숫자로 구성)
 *                 example: johnDoe123
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *                 example: P@ssw0rd123
 *               username:
 *                 type: string
 *                 description: 사용자 이름
 *                 example: John Doe
 *               birth:
 *                 type: string
 *                 format: date
 *                 description: 사용자 생일 (yyyy-mm-dd 형식)
 *                 example: 1995-08-15
 *               phone:
 *                 type: string
 *                 description: 사용자 전화번호
 *                 example: 821012345678
 *               role:
 *                 type: string
 *                 description: 사용자 역할 (parent 또는 child)
 *                 example: parent
 *     responses:
 *       201:
 *         description: 사용자 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         description: 입력값 누락 또는 유효하지 않은 값
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All fields are required
 *       409:
 *         description: 중복된 ID가 존재
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ID already exists
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
// 회원가입
router.post("/signup", async (req, res) => {
	const { id, password, username, birth, phone, role } = req.body;
	const salt = await bcrypt.genSalt();

	try {
		// 입력값 검증
		if (!id || !password || !username || !birth || !phone || !role) {
			return res.status(400).json({ message: "All fields are required" });
		}

		if (!validator.isAlphanumeric(id)) {
			return res.status(400).json({ message: "ID must be alphanumeric" });
		}

		// 중복 ID 확인
		const existingUser = await User.findOne({ where: { id: id } });
		if (existingUser) {
			return res.status(409).json({ message: "ID already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, salt);

		// 새로운 사용자 생성
		const newUser = await User.create({
			id,
			password: hashedPassword,
			username,
			birth,
			phone,
			role,
		});
		console.log("new User", newUser);

		res.status(201).json({
			message: "User registered successfully",
			data: {
				user_id: newUser.user_id,
				id: newUser.id,
				username: newUser.username,
				birth: newUser.birth,
				phone: newUser.phone,
				role: newUser.role,
			},
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User Login
 *     description: Logs in the user with the provided id and password, and returns a JWT token if successful.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - password
 *             properties:
 *               id:
 *                 type: string
 *                 description: Unique alphanumeric ID for the user.
 *                 example: johnDoe123
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: P@ssw0rd123
 *     responses:
 *       200:
 *         description: Login successful and token generated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicGFzc3dvcmQiOiIkMmEkM2I...etc"
 *       400:
 *         description: Bad request due to missing id or password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ID and password are required
 *       401:
 *         description: Unauthorized due to invalid password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid password
 *       404:
 *         description: User not found with the given id.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An unexpected error occurred
 */
// 로그인
router.post("/login", async (req, res) => {
	const { id, password } = req.body;

	try {
		// 입력값 검증
		if (!id || !password) {
			return res.status(400).json({ message: "ID and password are required" });
		}

		// 사용자 조회
		const user = await User.findOne({ where: { id } });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// 비밀번호 검증
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid password" });
		}

		// JWT 토큰 생성
		const token = jwt.sign(
			{ id: user.id, password: user.password },
			process.env.JWT_SECRET || "MyJWT",
			{ expiresIn: "1h" },
		);

		// JWT 토큰을 쿠키에 저장
		res.cookie("jwtToken", token, {
			httpOnly: true, // JavaScript에서 쿠키를 접근할 수 없도록 설정
			sameSite: "Strict", // 크로스 사이트 요청에서 쿠키를 보내지 않도록 설정
			maxAge: 3600000, // 1시간
		});

		res.status(200).json({
			message: "Login successful",
			user_id: user.user_id,
			id: user.id,
			username: user.username,
			birth: user.birth,
			phone: user.phone,
			school_auth: user.school_auth,
			parent_id: user.parent_id,
			role: user.role,
			school: user.school,
			open_token: user.open_token,
			user_seq_no: user.user_seq_no,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * @swagger
 * /api/users/auth:
 *   get:
 *     summary: 사용자 식별 API
 *     description: JWT 토큰을 검증하고 해당 사용자의 ID를 반환합니다.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: 성공적으로 사용자 ID를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 사용자 ID
 *       401:
 *         description: 인증되지 않은 요청 (토큰이 없거나 유효하지 않음)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 오류 메시지
 *
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 오류 메시지
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 오류 메시지
 *     security:
 *       - BearerAuth: []
 */

// 로그아웃

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: 로그아웃
 *     description: 클라이언트의 JWT 토큰을 삭제하여 로그아웃합니다.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An unexpected error occurred
 */

// 로그아웃 API
router.post("/logout", (req, res) => {
	try {
		// JWT 토큰 쿠키 삭제
		res.clearCookie("jwtToken", {
			httpOnly: true,
			sameSite: "Strict",
		});

		res.status(200).json({ message: "Logout successful" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
// 사용자 식별 API
router.get("/auth", async (req, res) => {
	try {
		// 쿠키에서 JWT 토큰 가져오기
		const token = req.cookies.jwtToken;
		if (!token) {
			return res
				.status(401)
				.json({ message: "Unauthorized No token provided" });
		}

		// 토큰 검증
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "MyJWT");

		// 사용자 조회
		const user = await User.findOne({ where: { id: decoded.id } });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// 사용자 ID 반환
		res.status(200).json({
			user_id: user.user_id,
			id: user.id,
			username: user.username,
			birth: user.birth,
			phone: user.phone,
			school_auth: user.school_auth,
			role: user.role,
			school: user.school,
			parent_id: user.parent_id,
			open_token: user.open_token,
			user_seq_no: user.user_seq_no,
		});
	} catch (error) {
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ message: "Invalid token" });
		}
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ message: "Token expired" });
		}
		res.status(500).json({ error: error.message });
	}
});

/**
 * @swagger
 * /api/users/my-children:
 *   get:
 *     summary: Get children by parent_id
 *     description: Returns a list of users (id and name) whose parent_id matches the provided parent_id
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: parent_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The parent_id to filter users
 *     responses:
 *       200:
 *         description: A list of user details (id and name)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: User's ID
 *                   name:
 *                     type: string
 *                     description: User's name
 *       400:
 *         description: Missing or invalid parent_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: No users found for the provided parent_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
// parent_id로 사용자 조회 (id와 name 반환)
router.get("/my-children", async (req, res) => {
	try {
		const { parent_id } = req.query;

		// parent_id가 제공되지 않은 경우
		if (!parent_id) {
			return res.status(400).json({ error: "parent_id is required" });
		}

		// parent_id가 일치하는 모든 사용자 조회
		const users = await User.findAll({
			where: { parent_id },
			attributes: ["id", "username", "user_id"], // 필요한 필드만 선택
		});

		if (!users || users.length === 0) {
			return res
				.status(404)
				.json({ error: "No users found with the provided parent_id" });
		}

		// id와 name을 포함한 배열 반환
		const userDetails = users.map((user) => ({
			id: user.id,
			user_id: user.user_id,
			name: user.username,
		}));

		res.json(userDetails);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users by username or phone number
 *     description: Searches for users whose username or phone contains the provided query string.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: The search query to match against username or phone.
 *     responses:
 *       200:
 *         description: A list of users matching the search query.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The user ID.
 *                   name:
 *                     type: string
 *                     description: The username of the user.
 *                   phone:
 *                     type: string
 *                     description: The phone number of the user.
 *       400:
 *         description: Search query is required.
 *       404:
 *         description: No users found with the provided conditions.
 *       500:
 *         description: Internal server error.
 */
// user 검색
router.get("/search", async (req, res) => {
	try {
		const { query } = req.query;

		if (!query) {
			return res.status(400).json({ error: "Search query is required" });
		}

		const whereCondition = {
			[Op.and]: [
				{
					[Op.or]: [
						{ username: { [Op.like]: `%${query}%` } }, // 이름 포함 검색
						{ phone: { [Op.like]: `%${query}%` } }, // 휴대폰 번호 포함 검색
					],
				},
				{
					role: "child", // role이 "children"인 경우만 조회
				},
			],
		};

		// 검색 조건에 맞는 사용자 조회
		const users = await User.findAll({
			where: whereCondition,
			attributes: ["user_id", "id", "username", "phone"],
		});

		const userDetails = users.map((user) => ({
			user_id: user.user_id,
			id: user.id,
			name: user.username,
			phone: user.phone,
		}));

		res.json(userDetails);
	} catch (error) {
		console.error("Error fetching children:", error);
		res.status(500).json({ error: "Intrnal Server Error" });
	}
});

router.put("/token", async (req, res) => {
	console.log("body", req.body);
	const { userId, token, user_seq_no } = req.body;
	console.log(userId, token, user_seq_no);

	try {
		console.log(userId, token, user_seq_no);
		const user = await User.findOne({ where: { user_id: userId } });
		console.log(user);
		if (!user) {
			return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
		}
		user.open_token = token;
		user.user_seq_no = user_seq_no;
		await user.save();

		res.status(200).json({
			message: "Open API 토큰/유저가 성공적으로 업데이트되었습니다.",
			data: { open_api_token: user.open_token, user_seq_no: user.user_seq_no },
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "서버 오류, 다시 시도해주세요." });
	}
});

router.post("/token", async (req, res) => {
	const { code } = req.body;
	const requestData = new URLSearchParams();
	requestData.append("code", code);
	requestData.append("client_id", process.env.OPEN_BANK_ID);
	requestData.append("client_secret", process.env.CLIENT_SECRET);
	requestData.append("redirect_uri", process.env.REDIRECT_URI);
	requestData.append("grant_type", "authorization_code");

	try {
		const response = await axios.post(
			"https://testapi.openbanking.or.kr/oauth/2.0/token",
			requestData,
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
				},
			},
		);
		res.json(response.data); // OpenAPI로부터 받은 데이터 반환
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "API 호출 중 오류 발생" });
	}
});

router.post("/oauth", (req, res) => {
	const clientId = process.env.OPEN_BANK_ID;
	const redirectUri = process.env.REDIRECT_URI;
	const authUrl = `https://testapi.openbanking.or.kr/oauth/2.0/authorize?response_type=code&client_id=${clientId}&scope=login%20inquiry%20transfer&state=12345678901234567890123456789012&auth_type=0&redirect_uri=${redirectUri}`;
	res.send(authUrl);
	// res.json(authUrl);
});

router.get("/me", async (req, res) => {
	const { token, user_seq_no } = req.query;
	try {
		const response = await axios.get(
			`https://testapi.openbanking.or.kr/v2.0/user/me?user_seq_no=${user_seq_no}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		res.json(response.data);
	} catch (error) {
		console.error("Error calling Open Banking API:", error);
		res.status(500).json({ error: "Failed to fetch open user data" });
	}
});
router.put("/:id", async (req, res) => {
	const user_id = req.params.id;
	const { schoolName } = req.body;
	try {
		const updateSchool = await User.update(
			{
				school: schoolName,
			},
			{ where: { user_id: user_id } },
		);
		res.json({ ok: true, response: updateSchool });
	} catch (error) {
		console.error(error);
	}
});

router.get("/:id", async (req, res) => {
	try {
		const user = await User.findOne({
			where: { user_id: req.params.id },
		});
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: "Error fetching user data" });
	}
});

module.exports = router;
