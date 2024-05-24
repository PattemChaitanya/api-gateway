const mongoose = require("mongoose");
const logModel = require("./logs/index")(mongoose);
const userModel = require("./user/index")(mongoose);

module.exports = {
  logModel,
  userModel,
};
