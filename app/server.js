const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const middleware = require("../app/core/middlewares/gateway_middleware");
const { openDatabaseConnection } = require("./utils/database");
const morgan = require("morgan");

const app = express();
const port = 9090;
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(middleware);

app.listen(port, () => {
  openDatabaseConnection();
  console.log(`http://localhost:${port}`, `listening on port ${port}`);
});
