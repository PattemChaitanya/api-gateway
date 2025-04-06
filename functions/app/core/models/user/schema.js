/**
 * User schema definition for Firebase Firestore
 * This is not used by Firestore directly, but serves as a reference for the expected document structure
 */
module.exports = {
  username: { type: "string", required: true },
  password: { type: "string", required: true },
  token_access: { type: "string", default: "" },
  basic_auth: { type: "string", default: "" },
  createdAt: { type: "timestamp" },
  updatedAt: { type: "timestamp" },
};
