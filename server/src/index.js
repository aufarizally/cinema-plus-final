require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const fs = require('fs');

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

const port = process.env.PORT || 5000;

// --- 1. MIDDLEWARE DASAR & CORS FIX ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  const allowedOrigins = [
    'https://cinema-plus-app.vercel.app', 
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Access-Token'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- 2. STATIC FILES ---
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

const buildPath = path.join(__dirname, '../../client/build');
if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
}

// --- 3. ROUTES API (DENGAN AWALAN /API) ---
// Ini kunci supaya tidak 405 Method Not Allowed
app.use('/api', userRouter);
app.use('/api', movieRouter);
app.use('/api', cinemaRouter);
app.use('/api', showtimeRouter);
app.use('/api', reservationRouter);
app.use('/api', invitationsRouter);

// --- 4. CATCHALL HANDLER ---
app.get('/*', (req, res) => {
  const indexPath = path.join(__dirname, '../../client/build/index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Jika rute API salah tapi dipanggil lewat GET
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: "API Route not found" });
    }
    res.status(404).json({
      error: "Not Found",
      message: "Server is running. Endpoint tidak ditemukan."
    });
  }
});

app.listen(port, () => console.log(`🚀 Server aktif di PORT: ${port}`));