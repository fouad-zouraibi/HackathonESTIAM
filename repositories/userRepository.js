const { ObjectId } = require('mongodb');

const User = require('../models/userModel');
const { getDB } = require('../config/db');
const getUserByEmail = async (email) => {
    const db = getDB();
  const user = await db.collection('users').findOne({ email });
  if (user) {
    return new User(user._id, user.email, user.password, user.birthdate);
  }
  return null;
};

const createUser = async (email, password, birthdate) => {
    const db = getDB();
  const result = await db.collection('users').insertOne({ email, password, birthdate });
  return new User(result.insertedId, email, password, birthdate);
};

const getUserByEmailAndPassword = async (email, password) => {
    const db = getDB();
  const user = await db.collection('users').findOne({ email, password });
  if (user) {
    return new User(user._id, user.email, user.password, user.birthdate);
  }
  return null;
};

module.exports = {
  getUserByEmail,
  createUser,
  getUserByEmailAndPassword,
};
