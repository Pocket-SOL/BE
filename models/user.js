const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
	const User = sequelize.define(
		"user",
		{
			user_id: {
				autoIncrement: true,
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
			},
			id: {
				type: DataTypes.STRING(15),
				allowNull: false,
				unique: true, // UNIQUE 제약 조건 추가
			},
			birth: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			username: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			password: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			school_auth: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			parent_id: {
				type: DataTypes.BIGINT,
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "user",
			timestamps: false,
			indexes: [
				{
					name: "PRIMARY",
					unique: true,
					using: "BTREE",
					fields: [{ name: "user_id" }],
				},
			],
		},
	);

	return User;
};
