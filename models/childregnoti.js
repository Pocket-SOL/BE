const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
	return sequelize.define(
		"childregnoti",
		{
			notification_id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true,
			},
			sender_id: {
				// 알림을 보낸 사람 (부모 또는 자녀)
				type: DataTypes.BIGINT,
				allowNull: false,
				references: {
					model: "user", // 외래 키가 참조하는 테이블
					key: "user_id", // 참조되는 키
				},
			},
			receiver_id: {
				// 알림을 받을 사람 (부모 또는 자녀)
				type: DataTypes.BIGINT,
				allowNull: false,
				references: {
					model: "user", // 외래 키가 참조하는 테이블
					key: "user_id", // 참조되는 키
				},
			},
			type: {
				// 알림 종류 ('child_registration', 'accept', 'reject')
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			status: {
				// 알림 상태 ('Pending', 'Accepted', 'Rejected')
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
				allowNull: false,
			},
			updated_at: {
				type: DataTypes.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
				allowNull: false,
				onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		},
		{
			sequelize,
			tableName: "childregnoti", // 테이블 이름
			timestamps: false, // 자동 생성/수정 시간을 사용하지 않음 (명시적 컬럼 사용)
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
};
