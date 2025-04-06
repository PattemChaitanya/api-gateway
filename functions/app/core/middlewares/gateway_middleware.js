const router = require("express").Router();
const constants = require("../../utils/config");
const {
  forwardRequest,
  resolveRequest,
  resolveResponse,
  register,
  getAllUsers,
  login,
  registerService,
  updateService,
  getLogs,
} = require("../resolvers");
const {
  userValidationRules,
  serviceValidationRules,
  logValidationRules,
  authValidationRules,
} = require("./validation");

/**
 * @swagger
 * /consumer/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Create a new user account with the provided credentials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/consumer/register", userValidationRules.register, async (req, res) => {
  try {
    let result = await register(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

/**
 * @swagger
 * /consumer/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     description: Authenticate a user and return a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/consumer/login", userValidationRules.login, async (req, res) => {
  try {
    let result = await login(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({
      status: "error",
      message: err.message,
    });
  }
});

/**
 * @swagger
 * /service/register:
 *   post:
 *     tags: [Services]
 *     summary: Register a new service
 *     description: Add a new service to the gateway
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service successfully registered
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/service/register", serviceValidationRules.create, async (req, res) => {
  try {
    let result = await registerService(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

/**
 * @swagger
 * /service/{id}:
 *   put:
 *     tags: [Services]
 *     summary: Update a service
 *     description: Update an existing service configuration
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service successfully updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Service not found
 */
router.put("/service/:id", serviceValidationRules.update, async (req, res) => {
  try {
    let result = await updateService(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

/**
 * @swagger
 * /logs:
 *   get:
 *     tags: [Logs]
 *     summary: Get system logs
 *     description: Retrieve system logs with optional filters
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *         description: Filter by service name
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warn, error, debug]
 *         description: Filter by log level
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [request, error, metrics, system]
 *         description: Filter by log type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Number of logs to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of logs to skip
 *     responses:
 *       200:
 *         description: List of logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Log'
 */
router.get("/logs", logValidationRules.query, async (req, res) => {
  try {
    let result = await getLogs(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

// Validate API key for protected routes
router.use("/api/*", authValidationRules.apiKey, async (req, res, next) => {
  try {
    let data = await resolveRequest(req);
    if (data.error) {
      return res.status(getErrorStatus(data.error.type)).json({
        status: "error",
        message: data.error.message,
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

// Helper function to get appropriate error status
function getErrorStatus(errorType) {
  switch (errorType) {
    case "UNAUTHORIZED":
      return 401;
    case "NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
      return 400;
    case "FORBIDDEN":
      return 403;
    default:
      return 500;
  }
}

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
      if (Object.hasOwn(error, "type")) {
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
