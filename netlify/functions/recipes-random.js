const RecipeHandlers = require('../../app/handlers/recipeHandlers');

exports.handler = async (event) => {
  try {
    return await RecipeHandlers.getInstance().handleGetRandomRecipes(event);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 