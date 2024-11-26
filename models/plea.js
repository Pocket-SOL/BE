const { name } = require("ejs");
const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
	const Plea = sequelize.define(
		"plea",
		{
			plea_id: {
				autoIncrement: true,
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
			},
			amount: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
			},
			parent_id: {
				type: DataTypes.BIGINT,
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
		},
		{
			sequelize,
			tableName: "plea",
			timestamps: true,
			indexes: [
				{
					name: "PRIMARY",
					unique: true,
					using: "BTREE",
					fields: [{ name: "plea_id" }],
				},
				{
					name: "user_id",
					using: "BTREE",
					fields: [{ name: "user_id" }],
				},
			],
		},
	);
	return Plea;
};
