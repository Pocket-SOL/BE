const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('comment', {
    comment_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    purchase_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'purchase',
        key: 'purchase_id'
      }
    }
  }, {
    sequelize,
    tableName: 'comment',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "comment_id" },
        ]
      },
      {
        name: "purchase_id",
        using: "BTREE",
        fields: [
          { name: "purchase_id" },
        ]
      },
    ]
  });
};