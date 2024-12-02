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
db.ChildRegNoti = require("./childregnoti")(sequelize, Sequelize.DataTypes);
db.Account = require("./account")(sequelize, Sequelize.DataTypes);
db.History = require("./history")(sequelize, Sequelize.DataTypes);
db.Purchase = require("./purchase")(sequelize, Sequelize.DataTypes);
db.Purchaseuser = require("./purchaseuser")(sequelize, Sequelize.DataTypes);
db.Comment = require("./comment")(sequelize, Sequelize.DataTypes);
db.SubAccount = require("./subaccount")(sequelize, Sequelize.DataTypes);
db.SubAccountHistory = require("./subaccounthistory")(
	sequelize,
	Sequelize.DataTypes,
);
db.Mission = require("./mission")(sequelize, Sequelize.DataTypes);
db.ScheduledTransfer = require("./scheduledtransfer")(
	sequelize,
	Sequelize.DataTypes,
);
db.Plea = require("./plea")(sequelize, Sequelize.DataTypes);
db.ActivityLog = require("./activitylog")(sequelize, Sequelize.DataTypes);
db.Quiz = require("./quiz")(sequelize, Sequelize.DataTypes);
db.Tip = require("./tip")(sequelize, Sequelize.DataTypes);

db.Noti = require("./noti")(sequelize, Sequelize.DataTypes);

//관계설정
db.Account.hasMany(db.History, {
	foreignKey: "account_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.Account.hasMany(db.SubAccount, {
	foreignKey: "account_id",
	onDelete: "CASCADE", // SubAccount는 SET NULL로 설정
	onUpdate: "CASCADE",
});
db.Account.belongsTo(db.User, {
	foreignKey: "user_id",
	onDelete: "CASCADE", // Account의 user_id는 SET NULL로 설정
	onUpdate: "CASCADE",
});
db.Comment.belongsTo(db.Purchase, {
	foreignKey: "purchase_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.Comment.belongsTo(db.User, {
	foreignKey: "user_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.History.belongsTo(db.Account, {
	foreignKey: "account_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.Mission.belongsTo(db.User, {
	foreignKey: "user_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.Purchase.belongsTo(db.User, {
	foreignKey: "user_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.Purchase.hasMany(db.Purchaseuser, {
	foreignKey: "purchase_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.Purchase.hasMany(db.Comment, {
	foreignKey: "purchase_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.Purchaseuser.belongsTo(db.Purchase, {
	foreignKey: "purchase_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.ScheduledTransfer.belongsTo(db.SubAccount, {
	foreignKey: "sub_account_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.SubAccount.belongsTo(db.Account, {
	foreignKey: "account_id",
	onDelete: "CASCADE", // SubAccount의 account_id는 SET NULL로 설정
	onUpdate: "CASCADE",
});
db.SubAccount.hasMany(db.SubAccountHistory, {
	foreignKey: "sub_account_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.SubAccountHistory.belongsTo(db.SubAccount, {
	foreignKey: "sub_account_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.User.hasOne(db.Account, {
	foreignKey: "user_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.User.hasMany(db.User, {
	foreignKey: "parent_id",
	as: "children", // 자식을 참조
	onDelete: "SET NULL",
	onUpdate: "CASCADE",
});
db.User.belongsTo(db.User, {
	foreignKey: "parent_id",
	as: "parent", // 부모를 참조
	onDelete: "SET NULL",
	onUpdate: "CASCADE",
});
db.User.hasMany(db.Mission, {
	foreignKey: "user_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.User.hasMany(db.Purchase, {
	foreignKey: "user_id",
	onDelete: "SET NULL",
	onUpdate: "CASCADE",
});
db.User.hasMany(db.Comment, {
	foreignKey: "user_id",
	onDelete: "SET NULL",
	onUpdate: "CASCADE",
});
db.User.hasMany(db.Plea, {
	foreignKey: "user_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.Plea.belongsTo(db.User, {
	foreignKey: "user_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.ActivityLog.belongsTo(db.User, {
	foreignKey: "user_id",
	onDelete: "CASCADE", // 부모 삭제 시 자식 데이터도 삭제
	onUpdate: "CASCADE",
});

db.ChildRegNoti.belongsTo(db.User, {
	foreignKey: "sender_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.ChildRegNoti.belongsTo(db.User, {
	foreignKey: "receiver_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});

db.Noti.belongsTo(db.User, {
	foreignKey: "sender_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
db.Noti.belongsTo(db.User, {
	foreignKey: "receiver_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});

sequelize
	.sync({ alter: true })
	.then((result) => {
		console.log(result);
	})
	.catch((err) => {
		console.error(err);
	});

// db.User.sync({ alter: true })
// 	.then((result) => {
// 		console.log(result);
// 	})
// 	.catch((err) => {
// 		console.error(err);
// 	});

// db.Purchase.sync({ alter: true })
// 	.then((result) => {
// 		console.log(result);
// 	})
// 	.catch((err) => {
// 		console.error(err);
// 	});

// db.User.sync({ alter: true })
// 	.then((result) => {
// 		console.log(result);
// 	})
// 	.catch((err) => {
// 		console.error(err);
// 	});
// db.Noti.sync({ alter: true })
// 	.then((result) => {
// 		console.log(result);
// 	})
// 	.catch((err) => {
// 		console.error(err);
// 	});

// // db.Quiz.sync({ alter: true })
// // 	.then((result) => {
// // 		console.log(result);
// // 	})
// // 	.catch((err) => {
// // 		console.error(err);
// // 	});
//db객체 외부로 노출하기

db.Tip.sync({ alter: true })
	.then((result) => {
		console.log(result);
	})
	.catch((err) => {
		console.error(err);
	});
module.exports = db;
