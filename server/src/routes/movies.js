const express = require('express');
const auth = require('../middlewares/auth');
const upload = require('../utils/multer');
const Movie = require('../models/movie');
const userModeling = require('../utils/userModeling');

const router = new express.Router();

// Create Movie
router.post('/movies', auth.enhance, upload('movies').single('file'), async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}`;
  const { file } = req;
  
  // Debug log untuk memastikan data masuk ke server
  console.log("--- Request Masuk ---");
  console.log("Data Body:", req.body);
  console.log("Data File:", file);

  try {
    const movie = new Movie({
      ...req.body,
      // Perbaikan path: pastikan mengarah ke /uploads/movies/namafile
      image: file ? `${url}/uploads/movies/${file.filename}` : null 
    });

    await movie.save();
    res.status(201).send(movie);
  } catch (e) {
    console.log("Error detail saat save:", e);
    res.status(400).send(e);
  }
});

// Update Movie Photo ONLY
router.post('/movies/photo/:id', auth.enhance, upload('movies').single('file'), async (req, res) => {
    const url = `${req.protocol}://${req.get('host')}`;
    const { file } = req;
    const movieId = req.params.id;
    try {
      if (!file) return res.status(400).send({ error: 'Please upload a file' });
      
      const movie = await Movie.findById(movieId);
      if (!movie) return res.sendStatus(404);
      
      movie.image = `${url}/uploads/movies/${file.filename}`;
      await movie.save();
      res.send({ movie, file });
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

// Get all movies
router.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.send(movies);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get movie by id
router.get('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.sendStatus(404);
    res.send(movie);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Update movie data
router.put('/movies/:id', auth.enhance, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'language', 'genre', 'director', 'cast', 'description', 'duration', 'releaseDate', 'endDate'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates!' });

  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.sendStatus(404);

    updates.forEach((update) => (movie[update] = req.body[update]));
    await movie.save();
    res.send(movie);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete movie
router.delete('/movies/:id', auth.enhance, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.sendStatus(404);
    res.send(movie);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Movie Modeling
router.get('/movies/usermodeling/:username', async (req, res) => {
  try {
    const cinemasUserModeled = await userModeling.moviesUserModeling(req.params.username);
    res.send(cinemasUserModeled);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;