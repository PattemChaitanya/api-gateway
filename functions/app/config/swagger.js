const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Recipe API Documentation",
      description: "API documentation for Recipe Management System",
      version: "1.0.0",
    },
    servers: [
      {
        url: "https://apigateway-k2jc5kdq2a-uc.a.run.app/api/v1",
        description: "API Server (Production)",
      },
      {
        url: "http://localhost:9080/api/v1",
        description: "Local Development Server",
      },
    ],
    paths: {
      "/recipes": {
        get: {
          summary: "Get all recipes with pagination",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: {
                type: "integer",
                default: 1,
              },
            },
            {
              name: "limit",
              in: "query",
              schema: {
                type: "integer",
                default: 10,
              },
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RecipePagination",
                  },
                },
              },
            },
          },
        },
      },
      "/recipes-random": {
        get: {
          summary: "Get 10 random recipes",
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Recipe",
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/recipes-search": {
        get: {
          summary: "Search recipes",
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "Search query string",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Recipe",
                    },
                  },
                },
              },
            },
            400: {
              description: "Bad Request - Missing search query",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/recipe": {
        get: {
          summary: "Get single recipe by ID",
          parameters: [
            {
              name: "id",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Recipe",
                  },
                },
              },
            },
            404: {
              description: "Recipe not found",
            },
          },
        },
        put: {
          summary: "Update recipe",
          parameters: [
            {
              name: "id",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RecipeUpdate",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Recipe updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Recipe",
                  },
                },
              },
            },
            404: {
              description: "Recipe not found",
            },
          },
        },
      },
      // Reddit API Paths
      "/reddit/r/{subreddit}": {
        get: {
          summary: "Get posts from a subreddit",
          description: "Retrieve posts from a specific subreddit with sorting options",
          tags: ["Reddit"],
          parameters: [
            {
              name: "subreddit",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              description: "Name of the subreddit",
            },
            {
              name: "sort",
              in: "query",
              schema: {
                type: "string",
                enum: ["hot", "new", "top", "controversial"],
                default: "hot",
              },
              description: "Sorting criteria for posts",
            },
            {
              name: "limit",
              in: "query",
              schema: {
                type: "integer",
                default: 25,
              },
              description: "Number of posts to return",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/RedditPost",
                        },
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/reddit/r/{subreddit}/comments/{postId}": {
        get: {
          summary: "Get post comments",
          description: "Retrieve a post and its comments from a specific subreddit",
          tags: ["Reddit"],
          parameters: [
            {
              name: "subreddit",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              description: "Name of the subreddit",
            },
            {
              name: "postId",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              description: "ID of the post",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      post: {
                        $ref: "#/components/schemas/RedditPost",
                      },
                      comments: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/RedditComment",
                        },
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/reddit/r/{subreddit}/about": {
        get: {
          summary: "Get subreddit information",
          description: "Retrieve detailed information about a specific subreddit",
          tags: ["Reddit"],
          parameters: [
            {
              name: "subreddit",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              description: "Name of the subreddit",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/SubredditInfo",
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/reddit/search/posts": {
        get: {
          summary: "Search posts",
          description: "Search for posts across Reddit or within a specific subreddit",
          tags: ["Reddit"],
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "Search query",
            },
            {
              name: "subreddit",
              in: "query",
              schema: {
                type: "string",
              },
              description: "Optional subreddit to limit search to",
            },
            {
              name: "sort",
              in: "query",
              schema: {
                type: "string",
                enum: ["relevance", "hot", "top", "new", "comments"],
                default: "relevance",
              },
              description: "Sort criteria for search results",
            },
            {
              name: "limit",
              in: "query",
              schema: {
                type: "integer",
                default: 25,
              },
              description: "Number of results to return",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/RedditPost",
                        },
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/reddit/search/subreddits": {
        get: {
          summary: "Search subreddits",
          description: "Search for subreddits by name or topic",
          tags: ["Reddit"],
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "Search query",
            },
            {
              name: "limit",
              in: "query",
              schema: {
                type: "integer",
                default: 25,
              },
              description: "Number of results to return",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/SubredditInfo",
                        },
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/reddit/user/{username}": {
        get: {
          summary: "Get user profile",
          description: "Retrieve profile information for a specific Reddit user",
          tags: ["Reddit"],
          parameters: [
            {
              name: "username",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              description: "Reddit username",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/RedditUser",
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "API key for authentication",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              example: "Error message description",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            username: {
              type: "string",
              example: "john_doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password123!",
            },
          },
          required: ["username", "email", "password"],
        },
        Service: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "user-service",
            },
            endpoints: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["/users", "/users/{id}"],
            },
          },
          required: ["name", "endpoints"],
        },
        Log: {
          type: "object",
          properties: {
            service: {
              type: "string",
              example: "user-service",
            },
            level: {
              type: "string",
              enum: ["info", "warn", "error", "debug"],
              example: "info",
            },
            type: {
              type: "string",
              enum: ["request", "error", "metrics", "system"],
              example: "request",
            },
            message: {
              type: "string",
              example: "Request processed successfully",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Recipe: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            title: {
              type: "string",
            },
            description: {
              type: "string",
            },
            ingredients: {
              type: "array",
              items: {
                type: "string",
              },
            },
            instructions: {
              type: "array",
              items: {
                type: "string",
              },
            },
            cookingTime: {
              type: "integer",
              description: "Cooking time in minutes",
            },
            servings: {
              type: "integer",
            },
            imageUrl: {
              type: "string",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        RecipeUpdate: {
          type: "object",
          properties: {
            title: {
              type: "string",
            },
            description: {
              type: "string",
            },
            ingredients: {
              type: "array",
              items: {
                type: "string",
              },
            },
            instructions: {
              type: "array",
              items: {
                type: "string",
              },
            },
            cookingTime: {
              type: "integer",
            },
            servings: {
              type: "integer",
            },
            imageUrl: {
              type: "string",
            },
          },
        },
        RecipePagination: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Recipe",
              },
            },
            hasMore: {
              type: "boolean",
            },
          },
        },
        // Reddit API Schemas
        RedditPost: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "t3_abcdef",
            },
            title: {
              type: "string",
              example: "Interesting post title",
            },
            author: {
              type: "string",
              example: "username123",
            },
            subreddit: {
              type: "string",
              example: "programming",
            },
            selftext: {
              type: "string",
              example: "Post content goes here...",
            },
            score: {
              type: "integer",
              example: 542,
            },
            created_utc: {
              type: "number",
              example: 1609459200,
            },
            num_comments: {
              type: "integer",
              example: 48,
            },
            permalink: {
              type: "string",
              example: "/r/programming/comments/abcdef/interesting_post_title/",
            },
            url: {
              type: "string",
              example: "https://example.com/article",
            },
            is_self: {
              type: "boolean",
              example: false,
            },
            thumbnail: {
              type: "string",
              example: "https://b.thumbs.redditmedia.com/example.jpg",
            },
            upvote_ratio: {
              type: "number",
              example: 0.95,
            },
          },
        },
        RedditComment: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "t1_xyz123",
            },
            author: {
              type: "string",
              example: "commenter456",
            },
            body: {
              type: "string",
              example: "This is a comment on the post.",
            },
            score: {
              type: "integer",
              example: 25,
            },
            created_utc: {
              type: "number",
              example: 1609459300,
            },
            replies: {
              type: "object",
              description: "Nested comment replies",
            },
            permalink: {
              type: "string",
              example: "/r/programming/comments/abcdef/interesting_post/xyz123/",
            },
          },
        },
        SubredditInfo: {
          type: "object",
          properties: {
            display_name: {
              type: "string",
              example: "programming",
            },
            title: {
              type: "string",
              example: "Programming",
            },
            display_name_prefixed: {
              type: "string",
              example: "r/programming",
            },
            subscribers: {
              type: "integer",
              example: 3500000,
            },
            name: {
              type: "string",
              example: "t5_2qh0y",
            },
            description: {
              type: "string",
              example: "Computer programming discussions and news",
            },
            public_description: {
              type: "string",
              example: "Programming discussions and news",
            },
            created_utc: {
              type: "number",
              example: 1201233600,
            },
            url: {
              type: "string",
              example: "/r/programming/",
            },
            icon_img: {
              type: "string",
              example: "https://b.thumbs.redditmedia.com/example.png",
            },
          },
        },
        RedditUser: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "username123",
            },
            id: {
              type: "string",
              example: "t2_abc123",
            },
            comment_karma: {
              type: "integer",
              example: 12543,
            },
            link_karma: {
              type: "integer",
              example: 3789,
            },
            created_utc: {
              type: "number",
              example: 1536192000,
            },
            has_verified_email: {
              type: "boolean",
              example: true,
            },
            is_gold: {
              type: "boolean",
              example: false,
            },
            icon_img: {
              type: "string",
              example: "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Reddit",
        description: "Reddit API integration endpoints",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

// Generate the swagger specification
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
