const request = require("supertest");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const Server = require("../../app/server");

class ApiTestHelper {
  constructor(app) {
    this.app = app;
    this.server = new Server();
  }

  async init() {
    await this.server.start();
  }

  async cleanup() {
    await this.server.stop();
  }

  generateToken(payload = {}) {
    return jwt.sign(payload, process.env.JWT_SECRET || "test-secret");
  }

  generateApiKey() {
    return uuidv4();
  }

  async makeAuthenticatedRequest(method, url, token) {
    const apiKey = this.generateApiKey();
    const req = request(this.app)[method](url);
    return req.set("Authorization", `Bearer ${token}`).set("X-API-Key", apiKey);
  }
}

module.exports = ApiTestHelper;
