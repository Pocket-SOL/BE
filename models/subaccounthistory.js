const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('subaccounthistory', {
    sub_history_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    transaction_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    account_holder: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    account_number: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    sub_account_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'subaccount',
        key: 'sub_account_id'
      }
    },
    bank: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'subaccounthistory',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sub_history_id" },
        ]
      },
      {
        name: "sub_account_id",
        using: "BTREE",
        fields: [
          { name: "sub_account_id" },
        ]
      },
    ]
  });
};
