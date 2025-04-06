class Recipe {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || "";
    this.description = data.description || "";
    this.ingredients = data.recipeIngredients || [];
    this.instructions = data.recipeInstructions || [];
    this.prepTime = data.prepTime || 0;
    this.cookTime = data.cookTime || 0;
    this.servings = data.servings || 0;
    this.cuisine = data.cuisine || "";
    this.mealType = data.mealType || "";
    this.difficulty = data.difficulty || "medium";
    this.image = data.image || "";
    this.author = data.author || { "@type": "Person", name: "John Doe" };
    this.totalTime = data.totalTime || 0;
    this.recipeImage = data.recipeImage || "";
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      ingredients: this.ingredients,
      instructions: this.instructions,
      prepTime: this.prepTime,
      cookTime: this.cookTime,
      servings: this.servings,
      cuisine: this.cuisine,
      mealType: this.mealType,
      difficulty: this.difficulty,
      totalTime: this.totalTime,
      image: this.recipeImage,
      author: this.author,
    };
  }
}

module.exports = Recipe;
