const { collection, getDocs, query, limit, startAfter, orderBy, where, doc, getDoc, updateDoc } = require('firebase/firestore');
const BaseRepository = require('./BaseRepository');
const Recipe = require('../models/Recipe');
const FirebaseConfig = require('../config/firebase');

class FirebaseRecipeRepository extends BaseRepository {
  static #instance;
  #db;

  constructor() {
    super();
    this.#db = FirebaseConfig.getInstance().getDb();
    this.collectionName = 'recipes';
  }

  static getInstance() {
    if (!FirebaseRecipeRepository.#instance) {
      FirebaseRecipeRepository.#instance = new FirebaseRecipeRepository();
    }
    return FirebaseRecipeRepository.#instance;
  }

  // ... rest of the repository methods remain the same
}

module.exports = FirebaseRecipeRepository; 