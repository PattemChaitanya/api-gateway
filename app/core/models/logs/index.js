const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  level: {
    type: String,
    enum: ["info", "warn", "error", "debug"],
    default: "info",
  },
  type: {
    type: String,
    enum: ["request", "error", "metrics", "system"],
    default: "request",
  },
  message: String,
  method: String,
  url: String,
  status: Number,
  responseTime: Number,
  userAgent: String,
  ip: String,
  requestId: String,
  service: {
    type: String,
    required: true,
  },
  error: {
    message: String,
    stack: String,
    code: String,
  },
  metrics: {
    cpu: Number,
    memory: Number,
    requestCount: Number,
  },
});

// Indexes for better query performance
logSchema.index({ timestamp: -1 });
logSchema.index({ service: 1, timestamp: -1 });
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ type: 1, timestamp: -1 });

class LogModel {
  constructor() {
    this.model = mongoose.model("Log", logSchema);
  }

  async addLog(logData) {
    const log = new this.model(logData);
    return await log.save();
  }

  async getLogs(filters = {}, limit = 100, skip = 0) {
    return await this.model.find(filters).sort({ timestamp: -1 }).skip(skip).limit(limit);
  }

  async getLogsByService(service, limit = 100, skip = 0) {
    return await this.getLogs({ service }, limit, skip);
  }

  async getLogsByLevel(level, limit = 100, skip = 0) {
    return await this.getLogs({ level }, limit, skip);
  }

  async getLogsByType(type, limit = 100, skip = 0) {
    return await this.getLogs({ type }, limit, skip);
  }

  async getErrorLogs(limit = 100, skip = 0) {
    return await this.getLogsByLevel("error", limit, skip);
  }

  async getMetrics(service, startTime, endTime) {
    return await this.model.aggregate([
      {
        $match: {
          type: "metrics",
          service,
          timestamp: {
            $gte: startTime,
            $lte: endTime,
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: "$responseTime" },
          maxResponseTime: { $max: "$responseTime" },
          requestCount: { $sum: 1 },
          errorCount: {
            $sum: {
              $cond: [{ $eq: ["$level", "error"] }, 1, 0],
            },
          },
        },
      },
    ]);
  }
}

module.exports = new LogModel();
