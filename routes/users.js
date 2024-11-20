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
 * /api/users/signup:
 *   post:
 *     summary: User Signup
 *     description: Creates a new user with the provided information (id, password, birth, username).
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
 *               - birth
 *               - username
 *             properties:
 *               id:
 *                 type: string
 *                 description: Unique alphanumeric ID for the user.
 *                 example: johnDoe123
 *               password:
 *                 type: string
 *                 description: User's password to be hashed before saving.
 *                 example: P@ssw0rd123
 *               birth:
 *                 type: string
 *                 format: date
 *                 description: User's birth date in YYYY-MM-DD format.
 *                 example: 1995-08-15
 *               username:
 *                 type: string
 *                 description: User's display name.
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         description: Bad request due to missing or invalid fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All fields are required
 *       409:
 *         description: Conflict error due to duplicate ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ID already exists
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

// 회원가입
router.post("/signup", async (req, res) => {
	const { id, password, birth, username } = req.body;
	const salt = await bcrypt.genSalt();

	try {
		// 입력값 검증
		if (!id || !password || !birth || !username) {
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
			username,
			birth,
			password: hashedPassword,
		});
		console.log(newUser);

		res.status(201).json({
			message: "User registered successfully",
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// 로그인
router.post("/login", async (req, res) => {
	try {
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user information by userId
 *     description: Returns the information of the user based on the provided userId
 *     tags:
 *       - Users
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: The ID of the user to retrieve information for
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   description: The user ID of the user
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
//내정보확인
router.get("/:userId", async (req, res) => {
	const { userId } = req.params;
	try {
		const user = await User.findOne({ where: { user_id: userId } });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({
			userId: user.user_id,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
