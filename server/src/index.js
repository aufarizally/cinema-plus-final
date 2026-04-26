require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const fs = require('fs');

// Koneksi ke Database Cloud (MongoDB Atlas)
require('./db/mongoose');

// Routes
const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const cinemaRouter = require('./routes/cinema');
const showtimeRouter = require('./routes/showtime');
const reservationRouter = require('./routes/reservation');
const invitationsRouter = require('./routes/invitations');

const app = express();
app.disable('x-powered-by');

// PORT diambil dari .env, kalau tidak ada pakai 5000
const port = process.env.PORT || 5000;

// --- 1. MIDDLEWARE DASAR ---
app.use(express.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, X-Access-Token, XKey, Authorization'
  );
  next();
});

// --- 2. STATIC FILES ---
// Menangani folder uploads untuk gambar
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

console.log("INFO: Folder uploads dibaca dari:", uploadsPath);

// Serve React build jika kamu sudah melakukan 'npm run build' di folder client
const buildPath = path.join(__dirname, '../../client/build');
if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
}

// --- 3. ROUTES API ---
app.use(userRouter);
app.use(movieRouter);
app.use(cinemaRouter);
app.use(showtimeRouter);
app.use(reservationRouter);
app.use(invitationsRouter);

// --- 4. CATCHALL HANDLER ---
// Mengarahkan semua request selain API ke file index.html milik React (Frontend)
app.get('/*', (req, res) => {
  const indexPath = path.join(__dirname, '../../client/build/index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    if (req.url.startsWith('/uploads')) {
        return res.status(404).send('File gambar tidak ditemukan di folder fisik server.');
    }

    res.status(404).send({
      error: "Frontend build not found",
      message: "Server is running. Jika sedang coding (dev mode), abaikan pesan ini."
    });
  }
});

app.listen(port, () => console.log(`🚀 Server CinemaPlus aktif di PORT: ${port}`));