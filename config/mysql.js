const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mysql = require("mysql2");

const db_info = {
    host: process.env.DB_HOST,       // .env 파일에서 값 가져오기
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // 포트 기본값 3306
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };


const pool = mysql.createPool(db_info);

//데이터베이스 쿼리 메서드
module.exports = {
    init: function () {
        return pool;// 연결 풀 반환
    },
    // 쿼리 실행 함수
    query: function (sql, params) {
        return new Promise((resolve, reject) => {
            pool.query(sql, params, function (err, results) {
                if (err) {
                    reject(err);  // 쿼리 실패 시 에러 처리
                } else {
                    resolve(results);  // 쿼리 성공 시 결과 반환
                }
            });
        });
    },
};