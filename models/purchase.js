const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
	return sequelize.define(
		"purchase",
		{
			purchase_id: {
				autoIncrement: true,
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
			},
			title: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			content: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			end_date: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			user_id: {
				type: DataTypes.BIGINT,
				allowNull: true,
				references: {
					model: "user",
					key: "user_id",
				},
			},
			username: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			user_id: {
				type: DataTypes.BIGINT,
				allowNull: true,
				references: {
					model: "user",
					key: "user_id",
				},
			},
			participants: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			amount: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			count: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			school: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "purchase",
			timestamps: false,
			indexes: [
				{
					name: "PRIMARY",
					unique: true,
					using: "BTREE",
					fields: [{ name: "purchase_id" }],
				},
				{
					name: "user_id",
					using: "BTREE",
					fields: [{ name: "user_id" }],
				},
			],
		},
	);
	return Purchase;
};
