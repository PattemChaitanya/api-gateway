const mongoose = require("mongoose");
const { MONGODB_URL, DB_NAME } = require("./config");
mongoose.set("runValidators", true);

module.exports = {
  openDatabaseConnection: () => {
    console.log("Connecting to database");
    mongoose
      .connect(`${MONGODB_URL}/${DB_NAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((result) => {
        console.log("Connected to database");
      })
      .catch((err) => {
        console.log(err);
        throw Error(err);
      });
  },
};
