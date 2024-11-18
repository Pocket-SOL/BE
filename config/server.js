const express = require("express");
const mysql = require("mysql2");
const db = require("./mysql"); // 주어진 db_info 코드
const tables = require("./table");

const app = express();
const PORT = 3000;

// 데이터베이스 연결 및 테이블 생성
const initializeDatabase = () => {
  const connection = db.init(); // MySQL 연결 객체 생성

  db.connect(connection); // 연결 시도

  // 테이블 초기화
  tables.forEach((query) => {
    connection.query(query, (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        console.log("Table created or already exists.");
      }
    });
  });

  connection.end(); // 연결 종료
};

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  initializeDatabase(); // 서버 시작 시 데이터베이스 초기화
});
