const express = require("express");
const axios = require("axios");
const { LoggingService } = require("../core/services/LoggingService");

/**
 * Reddit API integration class
 * Handles communication with the Reddit public API
 */
class RedditAPI {
  constructor() {
    this.accessTokenBaseUrl = "https://www.reddit.com";
    this.baseUrl = "https://oauth.reddit.com";
    this.logger = new LoggingService();
  }

  /**
   * Get singleton instance of RedditAPI
   * @returns {RedditAPI} Singleton instance
   */
  static getInstance() {
    if (!RedditAPI.instance) {
      RedditAPI.instance = new RedditAPI();
    }
    return RedditAPI.instance;
  }

  /**
   * Get a new access token from Reddit
   * @returns {Promise<Object>} API response object with access token
   */
  async getAccessToken() {
    try {
      const auth = Buffer.from(
        `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`,
      ).toString("base64");

      const response = await axios.post(
        `${this.accessTokenBaseUrl}/api/v1/access_token`,
        new URLSearchParams({
          grant_type: "password",
          username: process.env.REDDIT_USERNAME,
          password: process.env.REDDIT_PASSWORD,
        }),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      return response.data.access_token;
    } catch (error) {
      this.logger.logError(error, { service: "reddit", operation: "getAccessToken" });
      throw error;
    }
  }

  /**
   * Retrieve posts from a subreddit with sorting options
   * @param {string} subreddit - Name of the subreddit
   * @param {string} sort - Sorting criteria (hot, new, top, controversial)
   * @param {number} limit - Number of posts to return
   * @returns {Promise<Object>} API response object
   */
  async getPosts(subreddit, sort = "hot", limit = 25) {
    try {
      const accessToken = await this.getAccessToken();

      const url = `${this.baseUrl}/r/${subreddit}/${sort}.json?limit=${limit}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data: response.data.data.children.map((child) => child.data),
        }),
      };
    } catch (error) {
      this.logger.logError(error, { service: "reddit", operation: "getPosts" });
      return {
        statusCode: error.response?.status || 500,
        body: JSON.stringify({
          success: false,
          error: error.message || "Failed to fetch posts",
        }),
      };
    }
  }

  /**
   * Retrieve a post and its comments
   * @param {string} postId - ID of the post
   * @param {string} subreddit - Name of the subreddit
   * @returns {Promise<Object>} API response object with post and comments
   */
  async getPostComments(postId, subreddit) {
    try {
      const accessToken = await this.getAccessToken();

      const url = `${this.baseUrl}/r/${subreddit}/comments/${postId}.json`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          post: response.data[0].data.children[0].data,
          comments: response.data[1].data.children.map((child) => child.data),
        }),
      };
    } catch (error) {
      this.logger.logError(error, { service: "reddit", operation: "getPostComments" });
      return {
        statusCode: error.response?.status || 500,
        body: JSON.stringify({
          success: false,
          error: error.message || "Failed to fetch comments",
        }),
      };
    }
  }

  /**
   * Get information about a subreddit
   * @param {string} subreddit - Name of the subreddit
   * @returns {Promise<Object>} API response with subreddit information
   */
  async getSubredditInfo(subreddit) {
    try {
      const accessToken = await this.getAccessToken();

      const url = `${this.baseUrl}/r/${subreddit}/about.json`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data: response.data.data,
        }),
      };
    } catch (error) {
      this.logger.logError(error, { service: "reddit", operation: "getSubredditInfo" });
      return {
        statusCode: error.response?.status || 500,
        body: JSON.stringify({
          success: false,
          error: error.message || "Failed to fetch subreddit info",
        }),
      };
    }
  }

  /**
   * Search for posts across Reddit or within a specific subreddit
   * @param {string} query - Search query
   * @param {string} subreddit - Optional subreddit to limit search to
   * @param {string} sort - Sorting criteria for results
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} API response with search results
   */
  async searchPosts(query, subreddit = "", sort = "relevance", limit = 25) {
    try {
      const accessToken = await this.getAccessToken();

      const subredditPath = subreddit ? `r/${subreddit}/` : "";
      const url = `${this.baseUrl}/${subredditPath}search.json?q=${encodeURIComponent(query)}&sort=${sort}&limit=${limit}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data: response.data.data.children.map((child) => child.data),
        }),
      };
    } catch (error) {
      this.logger.logError(error, { service: "reddit", operation: "searchPosts" });
      return {
        statusCode: error.response?.status || 500,
        body: JSON.stringify({
          success: false,
          error: error.message || "Failed to search posts",
        }),
      };
    }
  }

  /**
   * Search for subreddits by name or topic
   * @param {string} query - Search query
   * @param {number} limit - Number of results to return
   * @returns {Promise<Object>} API response with subreddit search results
   */
  async searchSubreddits(query, limit = 25) {
    try {
      const accessToken = await this.getAccessToken();

      const url = `${this.baseUrl}/subreddits/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data: response.data.data.children.map((child) => child.data),
        }),
      };
    } catch (error) {
      this.logger.logError(error, { service: "reddit", operation: "searchSubreddits" });
      return {
        statusCode: error.response?.status || 500,
        body: JSON.stringify({
          success: false,
          error: error.message || "Failed to search subreddits",
        }),
      };
    }
  }

  /**
   * Get a Reddit user's profile information
   * @param {string} username - Reddit username
   * @returns {Promise<Object>} API response with user profile data
   */
  async getUserProfile(username) {
    try {
      const accessToken = await this.getAccessToken();

      const url = `${this.baseUrl}/user/${username}/about.json`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data: response.data.data,
        }),
      };
    } catch (error) {
      this.logger.logError(error, { service: "reddit", operation: "getUserProfile" });
      return {
        statusCode: error.response?.status || 500,
        body: JSON.stringify({
          success: false,
          error: error.message || "Failed to fetch user profile",
        }),
      };
    }
  }
}

const redditRouter = express.Router();

/**
 * @swagger
 * /reddit/r/{subreddit}:
 *   get:
 *     summary: Get posts from a subreddit
 *     description: Retrieve posts from a specific subreddit with sorting options
 *     tags: [Reddit]
 *     parameters:
 *       - name: subreddit
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the subreddit
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [hot, new, top, controversial]
 *           default: hot
 *         description: Sorting criteria for posts
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Number of posts to return
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Server error
 */
redditRouter.get("/reddit/r/:subreddit", async (req, res) => {
  try {
    const { subreddit } = req.params;
    const { sort = "hot", limit = 25 } = req.query;
    const redditAPI = RedditAPI.getInstance();
    const response = await redditAPI.getPosts(subreddit, sort, limit);
    res.status(response.statusCode).json(JSON.parse(response.body));
  } catch (error) {
    LoggingService.logError(error, {
      requestId: req.id,
      service: "reddit",
    });
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process reddit request",
    });
  }
});

/**
 * @swagger
 * /reddit/r/{subreddit}/comments/{postId}:
 *   get:
 *     summary: Get post comments
 *     description: Retrieve a post and its comments from a specific subreddit
 *     tags: [Reddit]
 *     parameters:
 *       - name: subreddit
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the subreddit
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Server error
 */
redditRouter.get("/reddit/r/:subreddit/comments/:postId", async (req, res) => {
  try {
    const { subreddit, postId } = req.params;
    const redditAPI = RedditAPI.getInstance();
    const response = await redditAPI.getPostComments(postId, subreddit);
    res.status(response.statusCode).json(JSON.parse(response.body));
  } catch (error) {
    LoggingService.logError(error, {
      requestId: req.id,
      service: "reddit",
    });
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process reddit request",
    });
  }
});

/**
 * @swagger
 * /reddit/r/{subreddit}/about:
 *   get:
 *     summary: Get subreddit information
 *     description: Retrieve detailed information about a specific subreddit
 *     tags: [Reddit]
 *     parameters:
 *       - name: subreddit
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the subreddit
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Server error
 */
redditRouter.get("/reddit/r/:subreddit/about", async (req, res) => {
  try {
    const { subreddit } = req.params;
    const redditAPI = RedditAPI.getInstance();
    const response = await redditAPI.getSubredditInfo(subreddit);
    res.status(response.statusCode).json(JSON.parse(response.body));
  } catch (error) {
    LoggingService.logError(error, {
      requestId: req.id,
      service: "reddit",
    });
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process reddit request",
    });
  }
});

/**
 * @swagger
 * /reddit/search/posts:
 *   get:
 *     summary: Search posts
 *     description: Search for posts across Reddit or within a specific subreddit
 *     tags: [Reddit]
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - name: subreddit
 *         in: query
 *         schema:
 *           type: string
 *         description: Optional subreddit to limit search to
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [relevance, hot, top, new, comments]
 *           default: relevance
 *         description: Sort criteria for search results
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Server error
 */
redditRouter.get("/reddit/search/posts", async (req, res) => {
  try {
    const { q, subreddit = "", sort = "relevance", limit = 25 } = req.query;
    const redditAPI = RedditAPI.getInstance();
    const response = await redditAPI.searchPosts(q, subreddit, sort, limit);
    res.status(response.statusCode).json(JSON.parse(response.body));
  } catch (error) {
    LoggingService.logError(error, {
      requestId: req.id,
      service: "reddit",
    });
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process reddit request",
    });
  }
});

/**
 * @swagger
 * /reddit/search/subreddits:
 *   get:
 *     summary: Search subreddits
 *     description: Search for subreddits by name or topic
 *     tags: [Reddit]
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Server error
 */
redditRouter.get("/reddit/search/subreddits", async (req, res) => {
  try {
    const { q, limit = 25 } = req.query;
    const redditAPI = RedditAPI.getInstance();
    const response = await redditAPI.searchSubreddits(q, limit);
    res.status(response.statusCode).json(JSON.parse(response.body));
  } catch (error) {
    LoggingService.logError(error, {
      requestId: req.id,
      service: "reddit",
    });
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process reddit request",
    });
  }
});

/**
 * @swagger
 * /reddit/user/{username}:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve profile information for a specific Reddit user
 *     tags: [Reddit]
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Reddit username
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Server error
 */
redditRouter.get("/reddit/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const redditAPI = RedditAPI.getInstance();
    const response = await redditAPI.getUserProfile(username);
    res.status(response.statusCode).json(JSON.parse(response.body));
  } catch (error) {
    LoggingService.logError(error, {
      requestId: req.id,
      service: "reddit",
    });
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process reddit request",
    });
  }
});

module.exports = redditRouter;
