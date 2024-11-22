const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
	const ScheduledTransfer = sequelize.define(
		"scheduledtransfer",
		{
			scheduled_id: {
				autoIncrement: true,
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
			},
			scheduled_date: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			bank: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			amount: {
				type: DataTypes.DECIMAL(15, 2),
				allowNull: false,
			},
			account_number: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			account_holder: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			sub_account_id: {
				type: DataTypes.BIGINT,
				allowNull: true,
				references: {
					model: "subaccount",
					key: "sub_account_id",
				},
			},
		},
		{
			sequelize,
			tableName: "scheduledtransfer",
			timestamps: false,
			indexes: [
				{
					name: "PRIMARY",
					unique: true,
					using: "BTREE",
					fields: [{ name: "scheduled_id" }],
				},
				{
					name: "sub_account_id",
					using: "BTREE",
					fields: [{ name: "sub_account_id" }],
				},
			],
		},
	);

	return ScheduledTransfer;
};
