const {
  collection,
  getDocs,
  query,
  limit,
  startAfter,
  where,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
} = require("firebase/firestore");
const BaseRepository = require("./BaseRepository");
const Recipe = require("../models/Recipe");
const FirebaseConfig = require("../config/firebase");

class FirebaseRecipeRepository extends BaseRepository {
  static #instance;
  #db;

  constructor() {
    super();
    this.#db = FirebaseConfig.getInstance().getDb();
    this.collectionName = "kaggle-recipes";
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
      const q = query(recipesRef, limit(limitCount));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          new Recipe({
            id: doc.id,
            ...doc.data(),
          })
      );
    } catch (error) {
      console.error("Error finding all recipes:", error);
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
          ...docSnap.data(),
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
        where("title", ">=", searchQuery),
        where("title", "<=", searchQuery + "\uf8ff"),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          new Recipe({
            id: doc.id,
            ...doc.data(),
          })
      );
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
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, updatedData);

      // Get the updated document
      const updatedDoc = await getDoc(docRef);

      if (updatedDoc.exists()) {
        return new Recipe({
          id: updatedDoc.id,
          ...updatedDoc.data(),
        });
      }

      return null;
    } catch (error) {
      console.error(`Error updating recipe ${id}:`, error);
      return null;
    }
  }

  async create(data) {
    try {
      const recipeData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const recipesRef = collection(this.#db, this.collectionName);
      const docRef = await addDoc(recipesRef, recipeData);

      // Get the created document
      const createdDoc = await getDoc(docRef);

      if (createdDoc.exists()) {
        return new Recipe({
          id: createdDoc.id,
          ...createdDoc.data(),
        });
      }

      return null;
    } catch (error) {
      console.error("Error creating recipe:", error);
      return null;
    }
  }

  async delete(id) {
    try {
      const docRef = doc(this.#db, this.collectionName, id);

      // Check if document exists before deleting
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error(`Recipe ${id} not found`);
        return false;
      }

      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting recipe ${id}:`, error);
      return false;
    }
  }
}

module.exports = FirebaseRecipeRepository;
