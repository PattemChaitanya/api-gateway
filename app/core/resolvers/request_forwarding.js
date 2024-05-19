const axios = require("axios").default;
const { SECRET_KEY } = require("../../utils/config");
const jwt = require("jsonwebtoken");

const payload = {
  gateway: "GATEWAY_PRATICE",
  gateway_secret: SECRET_KEY,
};

async function __generateGatewaySignature(secretKey) {
  try {
    return jwt.sign(payload, secretKey);
  } catch (e) {
    throw e;
  }
}

async function forwardRequest(request, service) {
  try {
    const method = request.method.toLowerCase();
    const token = await __generateGatewaySignature(service.secret_key);

    let axiosConfig = {
      method: method,
      baseURL: service.base_url + ":" + service.port,
      url: request.path,
      responseType: "json",
      headers: {
        gateway_signature: token,
        authorization: request.authorization,
      },
    };

    if (method !== "get") {
      axiosConfig.data = request.body;
      axiosConfig.params = request.params;
    }

    const response = await axios(axiosConfig);

    if (method === "get") {
      return response.data;
    } else {
      return response;
    }
  } catch (e) {
    console.log(e, "error in forwarding request");
  }
}

module.exports = { forwardRequest };
