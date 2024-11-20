// 서버 실행 코드
const express = require("express");
const db = require("./mysql"); // mysql.js 파일 가져오기

const app = express();
app.use(express.json());

// 테스트 라우트: DB 연결 테스트
app.get("/test-db", async (req, res) => {
  try {
    console.log("연결됨");
    const [rows] = await db.query("SELECT * FROM user;");
    res.json({ success: true, solution: rows });
  } catch (error) {
    console.error("Database connection error:", error);
    res
      .status(500)
      .json({ success: false, message: "Database connection failed" });
  }
});

// 서버 시작
const PORT = process.env.PORT || 3000; // 서버 포트 환경 변수에서 가져오기
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
