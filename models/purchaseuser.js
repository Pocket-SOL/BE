const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('purchaseuser', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true
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
    tableName: 'purchaseuser',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
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
