const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
	const Notification = sequelize.define(
		"notification",
		{
			notification_id: {
				autoIncrement: true,
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
			},
			type: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			isread: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false, // 기본값: 읽지 않음
			},
			status: {
				type: DataTypes.STRING(20),
				allowNull: true, // 자녀등록 상태가 없을 수도 있음
			},
			amount: {
				type: DataTypes.INTEGER,
				allowNull: true, // 금액은 송금/용돈 요청이 아닐 경우 NULL 가능
			},
			content: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW, // 기본값: 현재 시간
			},
			sender_id: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			receiver_id: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
		},
		{
			sequelize,
			tableName: "notifications", // 테이블 이름
			timestamps: false, // 자동 생성/수정 시간 컬럼 비활성화
			indexes: [
				{
					name: "PRIMARY",
					unique: true,
					using: "BTREE",
					fields: [{ name: "notification_id" }],
				},
			],
		},
	);

	return Notification;
};
