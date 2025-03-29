const FirebaseRecipeRepository = require('../repositories/FirebaseRecipeRepository');
const RecipeService = require('../services/RecipeService');

class RecipeHandlers {
  static #instance;
  #recipeService;

  constructor() {
    this.#recipeService = new RecipeService(FirebaseRecipeRepository.getInstance());
  }

  static getInstance() {
    if (!RecipeHandlers.#instance) {
      RecipeHandlers.#instance = new RecipeHandlers();
    }
    return RecipeHandlers.#instance;
  }

  async handleGetAllRecipes(event) {
    const { page = '1', limit = '10' } = event.queryStringParameters || {};
    const recipes = await this.#recipeService.getAllRecipes(
      parseInt(page),
      parseInt(limit)
    );
    return this.createResponse(200, recipes);
  }

  async handleGetRandomRecipes() {
    const recipes = await this.#recipeService.getRandomRecipes(10);
    return this.createResponse(200, recipes);
  }

  async handleSearchRecipes(event) {
    const { q } = event.queryStringParameters || {};
    
    if (!q) {
      return this.createResponse(400, { error: 'Search query is required' });
    }

    const recipes = await this.#recipeService.searchRecipes(q);
    return this.createResponse(200, recipes);
  }

  async handleGetRecipe(event) {
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return this.createResponse(400, { error: 'Recipe ID is required' });
    }

    const recipe = await this.#recipeService.getRecipeById(id);
    return this.createResponse(200, recipe);
  }

  async handleUpdateRecipe(event) {
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return this.createResponse(400, { error: 'Recipe ID is required' });
    }

    const recipeData = JSON.parse(event.body);
    const updatedRecipe = await this.#recipeService.updateRecipe(id, recipeData);
    return this.createResponse(200, updatedRecipe);
  }

  createResponse(statusCode, body) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
      body: JSON.stringify(body)
    };
  }
}

module.exports = RecipeHandlers; 