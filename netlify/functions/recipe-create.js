const RecipeHandlers = require("../../app/handlers/recipeHandlers");

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "POST") {
      return await RecipeHandlers.getInstance().handleCreateRecipe(event);
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
