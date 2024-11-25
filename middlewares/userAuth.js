const jwt = require("jsonwebtoken");
const { User } = require("../models");

const userAuth = async (req, res, next) => {
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

		// 사용자 ID 요청 객체에 추가.
		req.user_id = user.user_id;

		next();
	} catch (error) {
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ message: "Invalid token" });
		}
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ message: "Token expired" });
		}
		res.status(500).json({ error: error.message });
	}
};

module.exports = userAuth;
