function __createModel(mongoose) {
  const schema = require("./schema")(mongoose);
  schema.statics.getAll = async function () {
    try {
      const getAllUsers = await this.find({});
      return getAllUsers;
    } catch (err) {
      throw err;
    }
  };
  schema.statics.insertNewUser = async function (userData) {
    try {
      const insertNewUser = await userData.save();
      return insertNewUser;
    } catch (e) {
      throw e;
    }
  };
  schema.statics.findByBasicToken = async function (basicToken) {
    try {
      const findByBasicTokenUser = await this.findOne({
        basic_auth: basicToken,
      });
      return findByBasicTokenUser;
    } catch (e) {
      throw e;
    }
  };
  schema.statics.deleteUserByBasicToken = async function (basicToken) {
    try {
      const deleteUserByBasicToken = await this.deleteOne({
        basic_auth: basicToken,
      });
      return deleteUserByBasicToken;
    } catch (e) {
      throw e;
    }
  };
  schema.statics.updateUserData = async function (userData, basicToken) {
    try {
      const updateUserData = await this.updateOne(
        { basic_auth: basicToken },
        userData
      );
      return updateUserData;
    } catch (e) {
      throw e;
    }
  };

  return schema;
}

module.exports = (mongoose) => {
  const schema = __createModel(mongoose);
  return mongoose.model("user_model", schema);
};
