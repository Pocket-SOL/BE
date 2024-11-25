const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const router = express.Router();
const { User } = require("../models");
const { where } = require("sequelize");
const { format } = require("morgan");

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
		console.log(newUser);

		res.status(201).json({
			message: "User registered successfully",
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
			username: user.username,
			birth: user.birth,
			phone: user.phone,
			role: user.role,
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
		res.status(200).json({ id: user.id });
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
 * /api/users:
 *   get:
 *     summary: Get a list of users
 *     description: Returns a list of all users in the database
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Server error
 */
// 사용자 목록 조회
router.get("/", async (req, res) => {
	try {
		const users = await User.findAll();
		res.json(users);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 현재 로그인한 사용자 정보 가져오기
 *     description: 클라이언트 쿠키에 저장된 JWT 토큰을 이용해 사용자 정보를 반환합니다.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: 사용자 정보 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: 사용자의 이름
 *                   example: JohnDoe
 *                 birth:
 *                   type: string
 *                   format: date
 *                   description: 사용자의 생년월일
 *                   example: 1990-01-01
 *                 phone:
 *                   type: string
 *                   description: 사용자의 전화번호
 *                   example: "010-1234-5678"
 *                 role:
 *                   type: string
 *                   description: 사용자의 역할
 *                   example: parent
 *       401:
 *         description: 인증 실패 (토큰 없음, 유효하지 않음, 또는 만료됨)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 에러 메시지
 *                   example: "Unauthorized: No token provided"
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 에러 메시지
 *                   example: User not found
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 서버 에러 메시지
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user information
 *     description: Retrieve the information of the currently authenticated user based on the JWT token stored in cookies.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: johndoe
 *                 birth:
 *                   type: string
 *                   format: date
 *                   example: 1990-01-01
 *                 phone:
 *                   type: string
 *                   example: "010-1234-5678"
 *                 role:
 *                   type: string
 *                   example: admin
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No token provided"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */
router.get("/me", async (req, res) => {
	try {
		// 쿠키에서 JWT 토큰 가져오기
		const token = req.cookies.jwtToken;
		if (!token) {
			return res
				.status(401)
				.json({ message: "Unauthorized: No token provided" });
		}

		// 토큰 검증
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "MyJWT");

		// 사용자 조회
		const user = await User.findOne({ where: { id: decoded.id } });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// 사용자 정보 반환 (username, birth, phone, role)
		res.status(200).json({
			username: user.username,
			birth: user.birth,
			phone: user.phone,
			role: user.role,
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

module.exports = router;
