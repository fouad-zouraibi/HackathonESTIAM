const { MongoClient } = require('mongodb');
const { dbUri } = require('./config');

const client = new MongoClient(dbUri);

let db;

const connectDB = async () => {
  await client.connect();
  db = client.db();
  console.log('Connected to MongoDB');
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
};

module.exports = {
  connectDB,
  getDB,
};
