const router = require("express").Router();
const constants = require("../../utils/config");
const {
  forwardRequest,
  resolveRequest,
  resolveResponse,
  register,
  getAllUsers,
} = require("../resolvers");

router.post("/consumer/register", async (req, res) => {
  let data = req.body;
  try {
    let result = await register(data);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/consumer/users", async (req, res) => {
  let accessToken = req.headers["admin-access"];
  if (constants.SECRET_KEY === accessToken) {
    try {
      let docs = await getAllUsers();
      res.json({ data: docs });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(401).json({
      message: "You're not allowed to do this action.",
    });
  }
});

router.all("*", async (req, res) => {
  try {
    resolveResponse(res);
    const { request, service, error } = await resolveRequest(req);
    if (error) {
      let status_code;
      if (error.hasOwnProperty("type")) {
        if (error.type === "UNAUTHORIZED") {
          status_code = 401;
        } else if (error.type === "NOT_FOUND") {
          status_code = 404;
        } else {
          status_code = 500;
        }
      } else {
        status_code = 500;
      }
      res.status(status_code).json(error);
    } else {
      try {
        const response = await forwardRequest(request, service);
        res.json(response);
      } catch (err) {
        res.status(500).json(err);
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

const validateRequest = (req, res, next) => {
  const appId = req.headers["app_id"];
  const services = req.services;

  if (!appId) {
    return res.status(400).json({
      status: "error",
      message: "app_id header is required",
    });
  }

  if (!(appId in services)) {
    return res.status(404).json({
      status: "error",
      message: "Service not found",
    });
  }

  next();
};

module.exports = {
  validateRequest,
  router,
};
