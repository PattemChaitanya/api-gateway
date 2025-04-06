const express = require("express");
const RecipeHandlers = require("../handlers/recipeHandlers");
const { LoggingService } = require("../core/services/LoggingService");

const recipeRouter = express.Router();

recipeRouter.get("/recipes", async (req, res) => {
  try {
    const recipeHandlers = RecipeHandlers.getInstance();
    const mockEvent = {
      queryStringParameters: req.query,
    };
    const response = await recipeHandlers.handleGetAllRecipes(mockEvent);
    res.status(response.statusCode).json(JSON.parse(response.body));
  } catch (error) {
    LoggingService.logError(error, {
      requestId: req.id,
      service: "recipe",
    });
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process recipe request",
    });
  }
});

recipeRouter.get("/recipes-random", async (req, res) => {
  try {
    const recipeHandlers = RecipeHandlers.getInstance();
    const response = await recipeHandlers.handleGetRandomRecipes();
    res.status(response.statusCode).json(JSON.parse(response.body));
  } catch (error) {
    LoggingService.logError(error, {
      requestId: req.id,
      service: "recipe",
    });
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process recipe request",
    });
  }
});

recipeRouter.get("/recipes-search", async (req, res) => {
  try {
    const recipeHandlers = RecipeHandlers.getInstance();
    const mockEvent = {
      queryStringParameters: req.query,
    };
    const response = await recipeHandlers.handleSearchRecipes(mockEvent);
    res.status(response.statusCode).json(JSON.parse(response.body));
  } catch (error) {
    LoggingService.logError(error, {
      requestId: req.id,
      service: "recipe",
    });
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process recipe request",
    });
  }
});

recipeRouter.get("/recipe", async (req, res) => {
  try {
    const recipeHandlers = RecipeHandlers.getInstance();
    const mockEvent = {
      pathParameters: { id: req.query.id },
    };
    const response = await recipeHandlers.handleGetRecipe(mockEvent);
    res.status(response.statusCode).json(JSON.parse(response.body));
  } catch (error) {
    LoggingService.logError(error, {
      requestId: req.id,
      service: "recipe",
    });
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process recipe request",
    });
  }
});

module.exports = recipeRouter;
