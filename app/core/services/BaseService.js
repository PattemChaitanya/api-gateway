class BaseService {
  constructor() {
    if (this.constructor === BaseService) {
      throw new Error("Cannot instantiate abstract class");
    }
  }

  /**
   * Validate request before processing
   * @param {Object} _req - Express request object
   * @returns {Promise<boolean>}
   */
  validateRequest() {
    throw new Error("Method 'validateRequest' must be implemented");
  }

  /**
   * Process the request
   * @param {Object} _req - Express request object
   * @returns {Promise<Object>}
   */
  processRequest() {
    throw new Error("Method 'processRequest' must be implemented");
  }

  /**
   * Transform response before sending to client
   * @param {Object} response - Response object
   * @returns {Object}
   */
  transformResponse(response) {
    return {
      status: "success",
      data: response,
      service: this.constructor.name,
    };
  }

  /**
   * Handle errors in a consistent way
   * @param {Error} error - Error object
   * @returns {Object}
   */
  handleError(error) {
    return {
      status: "error",
      error: {
        code: error.code || "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
      service: this.constructor.name,
    };
  }
}

module.exports = BaseService;
