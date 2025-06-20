// db.js actualizado sin opciones innecesarias
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI; // en vez de hardcodear la URI
if (!uri) {
  throw new Error('❌ MONGODB_URI no está definida en las variables de entorno');
}
async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('❌ Error al conectar a MongoDB:', err.message);
  }
}

module.exports = connectDB;
