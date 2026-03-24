const PORT = Number(process.env.PORT || 4000);
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "permission_demo";
const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";

module.exports = {
  PORT,
  MONGO_URL,
  DB_NAME,
  AUTH_SECRET,
};
