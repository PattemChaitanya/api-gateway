/**
 * Base service class for common service functionality
 */
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
   * Handle errors in a consistent way
   * @param {Error} error - The error to handle
   * @returns {Object} Standardized error response
   */
  handleError(error) {
    return {
      error: true,
      message: error.message || 'An unknown error occurred',
      code: error.code || 'UNKNOWN_ERROR'
    };
  }

  /**
   * Transform service response to consistent format
   * @param {*} data - The data to transform
   * @returns {Object} Standardized response
   */
  transformResponse(data) {
    return {
      success: true,
      data
    };
  }
}

module.exports = BaseService;
