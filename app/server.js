const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 9090;
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200);
  res.send("you made it");
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`, `listening on port ${port}`);
});
