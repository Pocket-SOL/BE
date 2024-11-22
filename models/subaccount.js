const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
	const SubAccount = sequelize.define(
		"subaccount",
		{
			sub_account_id: {
				autoIncrement: true,
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
			},
			sub_account_usage: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			account_id: {
				type: DataTypes.BIGINT,
				allowNull: true,
				references: {
					model: "account",
					key: "account_id",
				},
			},
		},
		{
			sequelize,
			tableName: "subaccount",
			timestamps: false,
			indexes: [
				{
					name: "PRIMARY",
					unique: true,
					using: "BTREE",
					fields: [{ name: "sub_account_id" }],
				},
				{
					name: "account_id",
					using: "BTREE",
					fields: [{ name: "account_id" }],
				},
			],
		},
	);

	return SubAccount;
};
