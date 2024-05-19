const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const middleware = require("../app/core/middlewares/gateway_middleware");
const { openDatabaseConnection } = require("./utils/database");
const morgan = require("morgan");
const { PORT } = require("./utils/configs/config");

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(middleware);

app.listen(PORT, () => {
  openDatabaseConnection();
  console.log(`http://localhost:${PORT}`, `listening on port ${PORT}`);
});
