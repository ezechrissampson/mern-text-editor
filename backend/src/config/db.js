const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI);
  // eslint-disable-next-line no-console
  console.log('[db] MongoDB connected');
}

module.exports = connectDB;
