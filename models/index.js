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
db.SubAccount = require("./subaccount")(sequelize, Sequelize.DataTypes);
db.SubAccountHistory = require("./subaccounthistory")(
	sequelize,
	Sequelize.DataTypes,
);
db.Comment = require("./comment")(sequelize, Sequelize.DataTypes);
db.Mission = require("./mission")(sequelize, Sequelize.DataTypes);
db.Purchase = require("./purchase")(sequelize, Sequelize.DataTypes);
db.PurchaseUser = require("./purchaseuser")(sequelize, Sequelize.DataTypes);
db.ScheduledTransfer = require("./scheduledtransfer")(
	sequelize,
	Sequelize.DataTypes,
);

db.Account.hasMany(db.History, { foreignKey: "account_id" });
db.Account.hasMany(db.SubAccount, {
	foreignKey: "account_id", // subaccount 모델에서 참조하는 외래 키
});
db.Account.belongsTo(db.User, {
	foreignKey: "user_id",
});
db.Comment.belongsTo(db.Purchase, {
	foreignKey: "purchase_id",
});
db.Comment.belongsTo(db.User, {
	foreignKey: "user_id",
});
db.History.belongsTo(db.Account, {
	foreignKey: "account_id",
});
db.Mission.belongsTo(db.User, {
	foreignKey: "user_id",
});
db.Purchase.belongsTo(db.User, {
	foreignKey: "user_id",
});
db.Purchase.hasMany(db.PurchaseUser, {
	foreignKey: "purchase_id",
});
db.Purchase.hasMany(db.Comment, {
	foreignKey: "purchase_id",
});
db.PurchaseUser.belongsTo(db.Purchase, {
	foreignKey: "purchase_id",
});
db.ScheduledTransfer.belongsTo(db.SubAccount, {
	foreignKey: "sub_account_id",
});
db.SubAccount.belongsTo(db.Account, {
	foreignKey: "account_id", // 외래 키
});
db.SubAccount.hasMany(db.SubAccountHistory, {
	foreignKey: "sub_account_id",
});
db.SubAccount.hasMany(db.SubAccountHistory, {
	foreignKey: "sub_account_id",
});
db.SubAccountHistory.belongsTo(db.SubAccount, {
	foreignKey: "sub_account_id",
});

db.User.hasOne(db.Account, {
	foreignKey: "user_id",
});
db.User.hasMany(db.User, {
	foreignKey: "parent_id",
	as: "children", // 자식을 참조
});
db.User.belongsTo(db.User, {
	foreignKey: "parent_id",
	as: "parent", // 부모를 참조
});
db.User.hasMany(db.Mission, {
	foreignKey: "user_id",
});
db.User.hasMany(db.Purchase, {
	foreignKey: "user_id",
});
db.User.hasMany(db.Comment, {
	foreignKey: "user_id",
});

sequelize
	.sync()
	.then((result) => {
		console.log(result);
	})
	.catch((err) => {
		console.error(err);
	});
//db객체 외부로 노출하기
module.exports = db;
