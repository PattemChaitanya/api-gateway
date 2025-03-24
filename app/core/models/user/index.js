const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  basic_token: {
    type: String,
    required: true,
    unique: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

async function findByBasicToken(token) {
  return await this.findOne({ basic_token: token });
}

async function findByEmail(email) {
  return await this.findOne({ email });
}

async function validatePassword(password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.validatePassword = validatePassword;
userSchema.statics.findByBasicToken = findByBasicToken;
userSchema.statics.findByEmail = findByEmail;

module.exports = mongoose.model("User", userSchema);
