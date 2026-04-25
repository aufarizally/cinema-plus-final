const express = require('express');
const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

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
const port = process.env.PORT || 8080;

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

// --- 2. STATIC FILES (KEMUNGKINAN A) ---

// __dirname adalah server/src. 
// path.join(__dirname, '../uploads') akan mengarah ke server/uploads
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Log ini untuk kamu cek di terminal VS Code, pastikan jalurnya benar
console.log("INFO: Folder uploads dibaca dari:", uploadsPath);

// Serve React build jika ada
const buildPath = path.join(__dirname, '../../client/build');
if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
}

// --- 3. ROUTES ---
app.use(userRouter);
app.use(movieRouter);
app.use(cinemaRouter);
app.use(showtimeRouter);
app.use(reservationRouter);
app.use(invitationsRouter);

// --- 4. CATCHALL HANDLER ---
app.get('/*', (req, res) => {
  const indexPath = path.join(__dirname, '../../client/build/index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Jika mencoba akses /uploads tapi tidak ada filenya
    if (req.url.startsWith('/uploads')) {
        return res.status(404).send('File gambar tidak ditemukan di folder fisik server.');
    }

    res.status(404).send({
      error: "Frontend build not found",
      message: "Server is running. Jika sedang coding (dev mode), abaikan pesan ini."
    });
  }
});

app.listen(port, () => console.log(`app is running in PORT: ${port}`));