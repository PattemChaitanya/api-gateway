const User = require("../models/User");

async function __validateConsumerBasicAuth(userKey) {
  return await User.findByBasicToken(userKey);
}

async function resolveRequest(req) {
  const apiSignatureKey = req.headers["basic_auth"] || "";

  const response = {
    request: {
      basic_auth: apiSignatureKey,
      method: req.method,
      url: req.url,
      body: req.body,
      headers: req.headers,
    },
    service: null,
    error: null,
  };

  // Check if basic auth key is not specified
  if (!apiSignatureKey) {
    response.error = {
      type: "UNAUTHORIZED",
      message: "Basic auth key not specified",
    };
    return response;
  }

  // Validate consumer basic auth
  const consumer = await __validateConsumerBasicAuth(apiSignatureKey);
  if (!consumer) {
    response.error = {
      type: "UNAUTHORIZED",
      message: "Invalid basic auth key",
    };
    return response;
  }

  // Check if service exists
  const service = Object.entries(req.services).find(([, config]) => {
    return (
      Object.hasOwn(config, "endpoints") &&
      config.endpoints[req.method.toLowerCase()]?.includes(req.url)
    );
  });

  if (!service) {
    response.error = {
      type: "NOT_FOUND",
      message: "Service not found",
    };
    return response;
  }

  response.service = service;
  return response;
}

module.exports = {
  resolveRequest,
};
