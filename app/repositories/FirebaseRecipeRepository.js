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

  async findAll(page = 1, limitCount = 10) {
    try {
      const recipesRef = collection(this.#db, this.collectionName);
      const q = query(
        recipesRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => new Recipe({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error finding all recipes:', error);
      return [];
    }
  }

  async findById(id) {
    try {
      const docRef = doc(this.#db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return new Recipe({
          id: docSnap.id,
          ...docSnap.data()
        });
      }
      
      return null;
    } catch (error) {
      console.error(`Error finding recipe ${id}:`, error);
      return null;
    }
  }

  async findByQuery(searchQuery) {
    try {
      const recipesRef = collection(this.#db, this.collectionName);
      const q = query(
        recipesRef,
        where('title', '>=', searchQuery),
        where('title', '<=', searchQuery + '\uf8ff'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => new Recipe({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error searching recipes with query ${searchQuery}:`, error);
      return [];
    }
  }

  async update(id, data) {
    try {
      const docRef = doc(this.#db, this.collectionName, id);
      const updatedData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(docRef, updatedData);
      
      // Get the updated document
      const updatedDoc = await getDoc(docRef);
      
      if (updatedDoc.exists()) {
        return new Recipe({
          id: updatedDoc.id,
          ...updatedDoc.data()
        });
      }
      
      return null;
    } catch (error) {
      console.error(`Error updating recipe ${id}:`, error);
      return null;
    }
  }
}

module.exports = FirebaseRecipeRepository; 