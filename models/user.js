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
			password: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			username: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			birth: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			phone: {
				type: DataTypes.STRING(15), // 휴대폰 번호, 길이 15로 제한
				allowNull: false,
				validate: {
					is: /^[0-9]{10,15}$/,
				},
			},
			school_auth: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			role: {
				type: DataTypes.ENUM("parent", "child"), // 부모인지 자식인지
				allowNull: false,
			},
			parent_id: {
				type: DataTypes.BIGINT,
				allowNull: true,
			},
			school: {
				type: DataTypes.STRING(255),
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
