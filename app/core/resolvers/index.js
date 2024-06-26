const { forwardRequest } = require("./request_forwarding");
const { logModel } = require("../models/index");
const { resolveRequest } = require("./request_resolver")(logModel);
const { resolveResponse } = require("./response_resolver");
const { register, getAllUsers } = require("./fetching-data");

module.exports = {
  forwardRequest,
  resolveRequest,
  resolveResponse,
  register,
  getAllUsers,
};
