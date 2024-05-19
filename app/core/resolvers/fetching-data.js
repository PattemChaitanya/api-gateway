const { userModel } = require("../models/index");
const { SALT_ROUND } = require("../../utils/config");
const bcrypt = require("bcrypt");

async function __passwordHashing(key) {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUND);
    const hash = await bcrypt.hash(key, salt);
    return hash;
  } catch (err) {
    console.error(e, "error in hashing");
    throw err;
  }
}

async function registerUser(data) {
  try {
    let passwordTemp = data.password;

    let hashedPassword = await __passwordHashing(passwordTemp);
    data.password = hashedPassword;

    let hashedBasicAuth = await __passwordHashing(hashedPassword);

    let user = new userModel({
      username: data.username,
      password: data.password,
      basic_auth: hashedBasicAuth,
    });

    let insertedUserData = await userModel.insertUserData(user);
    return insertedUserData;
  } catch (e) {
    console.error(e, "error in register user");
    throw e;
  }
}

async function getAllUsers() {
  try {
    let allUserData = await userModel.getAll();
    return allUserData;
  } catch (e) {
    console.error(e, "error in getting all users");
    throw e;
  }
}

module.exports = { registerUser, getAllUsers };
