require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const cors = require('cors'); // Kita pakai package cors biar lebih stabil

// Koneksi ke Database Cloud (MongoDB Atlas)
require('./db/mongoose');

// Import Routes
const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const cinemaRouter = require('./routes/cinema');
const showtimeRouter = require('./routes/showtime');
const reservationRouter = require('./routes/reservation');
const invitationsRouter = require('./routes/invitations');

const app = express();
app.disable('x-powered-by');

// --- 1. MIDDLEWARE DASAR & CORS (VERSI BARBAR) ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Ini kunci bantai error CORS lu, Aufa!
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Access-Token');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- 2. STATIC FILES ---
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// --- 3. ROUTES API ---
app.use('/api', userRouter);
app.use('/api', movieRouter);
app.use('/api/cinemas', cinemaRouter); // Pastikan path ini sesuai dengan frontend
app.use('/api', showtimeRouter);
app.use('/api', reservationRouter);
app.use('/api', invitationsRouter);

// --- 4. CATCHALL ---
app.get('/*', (req, res) => {
  if (req.url.startsWith('/api')) {
      return res.status(404).json({ error: "API Route not found" });
  }
  res.status(200).json({ status: "Success", message: "Server is Running!" });
});

// --- 5. EXPORT ---
module.exports = app;