const mongoose = require('mongoose');

// Memanggil MONGODB_URL dari file .env
const connectionURL = process.env.MONGODB_URL;

mongoose.connect(connectionURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Mantap Aufa! Berhasil terhubung ke MongoDB Atlas Cloud'))
.catch((err) => {
  console.error('❌ Gagal konek ke database!');
  console.error('Pesan Error:', err.message);
});
mongoose.connect(connectionURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Tunggu 5 detik sebelum menyerah
  socketTimeoutMS: 45000, // Biar gak gampang putus
})