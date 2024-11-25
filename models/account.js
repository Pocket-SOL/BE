const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
	const Account = sequelize.define(
		"account",
		{
			account_id: {
				autoIncrement: true,
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
			},
			user_id: {
				type: DataTypes.BIGINT,
				allowNull: true,
				references: {
					model: "user",
					key: "user_id",
				},
			},
			account_number: {
				type: DataTypes.STRING(20),
				allowNull: false,
			},
		},
		{
			sequelize,
			tableName: "account",
			timestamps: false,
			indexes: [
				{
					name: "PRIMARY",
					unique: true,
					using: "BTREE",
					fields: [{ name: "account_id" }],
				},
				{
					name: "user_id",
					using: "BTREE",
					fields: [{ name: "user_id" }],
				},
			],
		},
	);

	return Account;
};
