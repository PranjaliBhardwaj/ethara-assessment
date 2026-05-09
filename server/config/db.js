const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI && String(process.env.MONGODB_URI).trim();
  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Add it in Railway Variables or server/.env');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err}`);
});

module.exports = connectDB;
