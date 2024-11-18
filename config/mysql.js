const mysql = require("mysql2");

const db_info = {
    host: "localhost", // 데이터베이스 주소
    port: "3306", // 데이터베이스 포트
    user: "root", // 로그인 계정
    password: "root", // 비밀번호 //본인 root 계정 비밀번호 사용
    database: "pocket_sol", // 엑세스할 데이터베이스
  };

module.exports = {
    init: function () {
      return mysql.createConnection(db_info);
    },
    connect: function (conn) {
      conn.connect(function (err) {
        if (err) console.error("mysql connection error : " + err);
        else console.log("mysql is connected successfully!");
      });
    },
};