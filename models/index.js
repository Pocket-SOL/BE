const path = require("path");
const Sequelize = require("sequelize");

//개발모드 환경설정
const env = process.env.NODE_ENV || "development";

//DB연결 환경설정정보 변경처리
const config = require(path.join(__dirname, "..", "config", "config.js"))[env];
const db = {};
const sequelize = new Sequelize(
	config.database,
	config.username,
	config.password,
	config,
);

//DB 처리 객체에 시퀄라이즈 정보 맵핑처리
//이후 DB객체를 통해 데이터 관리가능해짐
db.sequelize = sequelize; //DB연결정보를 포함한 DB제어 객체속성(CRUD)
db.Sequelize = Sequelize; //Sequelize팩키지에서 제공하는 각종 데이터 타입 및 관련 객체정보를 제공함

db.User = require("./user")(sequelize, Sequelize.DataTypes); // user 모델 불러오기
db.Account = require("./account")(sequelize, Sequelize.DataTypes);
db.History = require("./history")(sequelize, Sequelize.DataTypes);
db.Purchase = require("./purchase")(sequelize, Sequelize.DataTypes);
db.Purchaseuser = require("./purchaseuser")(sequelize, Sequelize.DataTypes);
db.Purchase.sync({ alter: true })
	.then((resp) => {
		console.log("Database sync successful:", resp);
	})
	.catch((error) => {
		console.error(error);
	});
db.Comment = require("./comment")(sequelize, Sequelize.DataTypes);
db.Comment.sync({ alter: true })
	.then((resp) => {
		console.log("Database sync successful:", resp);
	})
	.catch((error) => {
		console.error(error);
	});
//db객체 외부로 노출하기
module.exports = db;
