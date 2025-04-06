const validateRequest = (req, res, next) => {
  const appId = req.headers["app_id"];
  const services = req.services;

  if (!appId) {
    return res.status(400).json({
      status: "error",
      message: "app_id header is required",
    });
  }

  if (!Object.hasOwn(services, appId)) {
    return res.status(404).json({
      status: "error",
      message: "Service not found",
    });
  }

  next();
};

module.exports = {
  validateRequest,
};
