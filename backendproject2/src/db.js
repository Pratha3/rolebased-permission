const mongoose = require("mongoose");
const { MONGO_URL, DB_NAME } = require("./config");

async function connectMongo() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
  return mongoose.connection;
}

async function closeMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectMongo,
  closeMongo,
};
