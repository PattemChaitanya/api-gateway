const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { SALT_ROUND } = require("../../utils/config");

class User {
  constructor() {
    this.schema = new mongoose.Schema({
      username: {
        type: String,
        required: true,
        unique: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      apiKey: {
        type: String,
        unique: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    });

    // Add pre-save middleware
    this.schema.pre("save", async function (next) {
      if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, SALT_ROUND);
      }
      this.updatedAt = new Date();
      next();
    });

    // Add instance methods
    this.schema.methods.comparePassword = async function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    };

    this.schema.methods.generateApiKey = async function () {
      this.apiKey = await bcrypt.hash(this._id.toString(), SALT_ROUND);
      await this.save();
      return this.apiKey;
    };

    // Add static methods
    this.schema.statics.findByEmail = function (email) {
      return this.findOne({ email });
    };

    this.schema.statics.findByApiKey = function (apiKey) {
      return this.findOne({ apiKey });
    };

    // Create the model
    this.model = mongoose.model("User", this.schema);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>}
   */
  async create(userData) {
    const user = new this.model(userData);
    await user.generateApiKey();
    return user.save();
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>}
   */
  async findById(id) {
    return this.model.findById(id);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object>}
   */
  async findByEmail(email) {
    return this.model.findByEmail(email);
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>}
   */
  async update(id, updateData) {
    return this.model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<Object>}
   */
  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }
}

module.exports = User;
