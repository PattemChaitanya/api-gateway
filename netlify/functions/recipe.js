const RecipeHandlers = require('../../app/handlers/recipeHandlers');

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      return await RecipeHandlers.getInstance().handleGetRecipe(event);
    }
    if (event.httpMethod === 'PUT') {
      return await RecipeHandlers.getInstance().handleUpdateRecipe(event);
    }
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 