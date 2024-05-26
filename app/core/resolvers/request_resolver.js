const { userModel } = require("../models/index");
const fs = require("fs");
const yaml = require("yaml");

async function __validateConsumerBasicAuth(userKey, userModel) {
  try {
    return await userModel.findByBasicToken(userKey);
  } catch (e) {
    throw e;
  }
}

function __grabRequest(req) {
  const ipAddress =
    (req.headers["x-forwarded-for"] || "").split(",").pop() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  const apiSignatureKey = req.headers["basic_auth"] || "";
  return {
    ip_address: ipAddress,
    basic_auth: apiSignatureKey,
    host: req.headers["host"],
    user_agent: req.headers["user-agent"] || "",
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    query: req.query,
    params: req.params,
    app_id: req.headers["app_id"],
    body: req.body,
    authorization: req.headers["Authorization"] || "",
  };
}

async function __getServiceInformation(service_name) {
  const file = fs.readFileSync("./app/gateway_conf.yml", "utf8");
  const conf = yaml.parse(file);
  if (conf.services.hasOwnProperty(service_name)) {
    return conf.services[service_name];
  } else {
    const err = {
      type: "NOT_FOUND",
      module_source: "request_resolver",
      message: "Invalid service access. Please check your request again/",
    };
    throw err;
  }
}

async function __resolveRequest(req, logModel) {
  try {
    let request = __grabRequest(req);
    // Check if basic auth key is not specified
    if (request.basic_auth === "") {
      const err = {
        type: "UNAUTHORIZED",
        module_source: "request_resolver",
        message: "You're not allowed to access this network",
      };
      throw err;
    }

    await __validateConsumerBasicAuth(request.basic_auth, userModel);

    // Get service information from the configuration file
    const service = await __getServiceInformation(request.app_id || "");
    let flag = false;

    const availableEndPoints =
      service.endpoints[request.method.toLowerCase()] || [];
    const splittedRequestPath = request.path.replace(/^\/|\/$/g, "").split("/");
    for (let i = 0; i < availableEndPoints.length; i++) {
      let splittedEndPointPath = availableEndPoints[i]
        .replace(/^\/|\/$/g, "")
        .split("/");
      if (splittedRequestPath.length === splittedEndPointPath.length) {
        let fractalCheckFlag = true;
        for (let j = 0; j < splittedEndPointPath.length; j++) {
          if (
            splittedEndPointPath[j] !== splittedRequestPath[j] &&
            splittedEndPointPath[j] !== "*"
          ) {
            fractalCheckFlag = false;
            break;
          }
        }
        if (fractalCheckFlag) {
          flag = true;
          break;
        }
      }
    }
    if (flag) {
      // If method found
      await logModel.addLog(
        new logModel({
          path: request.path,
          service: request.app_id,
          ip_address: request.ip_address,
        })
      );
      return { request, service };
    } else {
      const err = {
        type: "NOT_FOUND",
        module_source: "request_resolver",
        message: "Request method is not found.",
      };
      throw err;
    }
  } catch (err) {
    if (err.type === "UNAUTHORIZED") {
      const err = {
        type: "UNAUTHORIZED",
        module_source: "request_resolver",
        message: "Your signature is not valid.",
      };
      throw err;
    } else {
      throw err;
    }
  }
}

module.exports = (logModel) => {
  return {
    resolveRequest: async (req) => {
      return await __resolveRequest(req, logModel);
    },
  };
};
