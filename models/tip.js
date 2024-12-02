const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
	const Tip = sequelize.define(
		"tip",
		{
			tip_id: {
				autoIncrement: true,
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
			},
			tip: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			answer: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "tip",
			timestamps: false,

			indexes: [
				{
					name: "PRIMARY",
					unique: true,
					using: "BTREE",
					fields: [{ name: "tip_id" }],
				},
			],
		},
	);

	return Tip;
};
