class Recipe {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.ingredients = data.ingredients || [];
    this.instructions = data.instructions || [];
    this.prepTime = data.prepTime || 0;
    this.cookTime = data.cookTime || 0;
    this.servings = data.servings || 0;
    this.cuisine = data.cuisine || '';
    this.mealType = data.mealType || '';
    this.difficulty = data.difficulty || 'medium';
    this.image = data.image || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
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
      image: this.image,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Recipe; 