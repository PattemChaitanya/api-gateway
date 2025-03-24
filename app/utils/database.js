const mongoose = require("mongoose");

async function connectToDatabase(uri) {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.info("Successfully connected to database");
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
};
