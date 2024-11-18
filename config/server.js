const express = require("express");
// const mysql = require("mysql2");
const db = require("./mysql"); // 주어진 db_info 코드
const tables = require("./table");

const app = express();
const PORT = 3000;

// 데이터베이스 연결 및 테이블 생성
const initializeDatabase = async() => {
  const pool = db.init(); // MySQL 연결 객체 생성

// 
for (const query of tables) {
    try {
      // Promise를 사용하여 연결 풀에서 쿼리 실행
      await new Promise((resolve, reject) => {
        pool.query(query, (err, result) => {
          if (err) {
            console.error("Error creating table:", err.message);
            reject(err); // 오류가 발생하면 Promise를 reject
          } else {
            console.log("Table created or already exists.");
            resolve(result); // 성공적으로 실행되면 Promise를 resolve
          }
        });
      });
    } catch (error) {
      console.error("Error during table creation:", error);
    }
  }
};

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  initializeDatabase(); // 서버 시작 시 데이터베이스 초기화
});
