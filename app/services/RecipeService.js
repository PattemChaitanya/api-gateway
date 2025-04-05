class RecipeService {
  #repository;

  constructor(repository) {
    this.#repository = repository;
  }

  async getAllRecipes(page, limit) {
    return this.#repository.findAll(page, limit);
  }

  async getRecipeById(id) {
    return this.#repository.findById(id);
  }

  async searchRecipes(query) {
    return this.#repository.findByQuery(query);
  }

  async updateRecipe(id, data) {
    return this.#repository.update(id, data);
  }

  async createRecipe(data) {
    return this.#repository.create(data);
  }

  async deleteRecipe(id) {
    return this.#repository.delete(id);
  }

  async getRandomRecipes(count) {
    // For now, just get all recipes and randomly select some
    const allRecipes = await this.#repository.findAll(1, 50);

    // If we have fewer recipes than requested, return all of them
    if (allRecipes.length <= count) {
      return allRecipes;
    }

    // Otherwise, randomly select 'count' recipes
    const randomRecipes = [];
    const indices = new Set();

    while (indices.size < count) {
      const randomIndex = Math.floor(Math.random() * allRecipes.length);
      if (!indices.has(randomIndex)) {
        indices.add(randomIndex);
        randomRecipes.push(allRecipes[randomIndex]);
      }
    }

    return randomRecipes;
  }
}

module.exports = RecipeService;
