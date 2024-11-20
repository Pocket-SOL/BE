var DataTypes = require("sequelize").DataTypes;
var _account = require("./account");
var _activitylog = require("./activitylog");
var _comment = require("./comment");
var _history = require("./history");
var _mission = require("./mission");
var _purchase = require("./purchase");
var _purchaseuser = require("./purchaseuser");
var _scheduledtransfer = require("./scheduledtransfer");
var _sequelizemeta = require("./sequelizemeta");
var _subaccount = require("./subaccount");
var _subaccounthistory = require("./subaccounthistory");
var _user = require("./user");

function initModels(sequelize) {
  var account = _account(sequelize, DataTypes);
  var activitylog = _activitylog(sequelize, DataTypes);
  var comment = _comment(sequelize, DataTypes);
  var history = _history(sequelize, DataTypes);
  var mission = _mission(sequelize, DataTypes);
  var purchase = _purchase(sequelize, DataTypes);
  var purchaseuser = _purchaseuser(sequelize, DataTypes);
  var scheduledtransfer = _scheduledtransfer(sequelize, DataTypes);
  var sequelizemeta = _sequelizemeta(sequelize, DataTypes);
  var subaccount = _subaccount(sequelize, DataTypes);
  var subaccounthistory = _subaccounthistory(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  history.belongsTo(account, { as: "account", foreignKey: "account_id"});
  account.hasMany(history, { as: "histories", foreignKey: "account_id"});
  subaccount.belongsTo(account, { as: "account", foreignKey: "account_id"});
  account.hasMany(subaccount, { as: "subaccounts", foreignKey: "account_id"});
  comment.belongsTo(purchase, { as: "purchase", foreignKey: "purchase_id"});
  purchase.hasMany(comment, { as: "comments", foreignKey: "purchase_id"});
  purchaseuser.belongsTo(purchase, { as: "purchase", foreignKey: "purchase_id"});
  purchase.hasMany(purchaseuser, { as: "purchaseusers", foreignKey: "purchase_id"});
  scheduledtransfer.belongsTo(subaccount, { as: "sub_account", foreignKey: "sub_account_id"});
  subaccount.hasMany(scheduledtransfer, { as: "scheduledtransfers", foreignKey: "sub_account_id"});
  subaccounthistory.belongsTo(subaccount, { as: "sub_account", foreignKey: "sub_account_id"});
  subaccount.hasMany(subaccounthistory, { as: "subaccounthistories", foreignKey: "sub_account_id"});
  account.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(account, { as: "accounts", foreignKey: "user_id"});
  activitylog.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(activitylog, { as: "activitylogs", foreignKey: "user_id"});
  mission.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(mission, { as: "missions", foreignKey: "user_id"});
  purchase.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(purchase, { as: "purchases", foreignKey: "user_id"});

  return {
    account,
    activitylog,
    comment,
    history,
    mission,
    purchase,
    purchaseuser,
    scheduledtransfer,
    sequelizemeta,
    subaccount,
    subaccounthistory,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
