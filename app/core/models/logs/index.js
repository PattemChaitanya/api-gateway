function __createModel(mongoose) {
  const schema = require("./schema")(mongoose);
  schema.statics.getAll = async function () {
    try {
      const getAll = await this.find({});
      return getAll;
    } catch (e) {
      throw e;
    }
  };
  schema.statics.getByID = async function (id) {
    try {
      const getByID = await this.findOne({ _id: id });
      return getByID;
    } catch (e) {
      throw e;
    }
  };
  schema.statics.addLog = async function (log) {
    try {
      const addLog = await log.save();
      return addLog;
    } catch (e) {
      throw e;
    }
  };

  return schema;
}

module.exports = (mongoose) => {
  const schema = __createModel(mongoose);
  return mongoose.model("log_model", schema);
};
