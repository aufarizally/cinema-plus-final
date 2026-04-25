const express = require('express');
const axios = require('axios'); // Tambahkan axios
const upload = require('../utils/multer');
const User = require('../models/user');
const auth = require('../middlewares/auth');

const router = new express.Router();

// Create a user
router.post('/users', async (req, res) => {
  try {
    const { role } = req.body;
    if (role) throw new Error('you cannot set role property.');
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/photo/:id', upload('users').single('file'), async (req, res, next) => {
  const url = `${req.protocol}://${req.get('host')}`;
  const { file } = req;
  const userId = req.params.id;
  try {
    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
    }
    const user = await User.findById(userId);
    if (!user) return res.sendStatus(404);
    user.imageurl = `${url}/${file.path}`;
    await user.save();
    res.send({ user, file });
  } catch (e) {
    console.log(e);
    res.sendStatus(400).send(e);
  }
});

// Login User
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.username, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({
      error: { message: 'You have entered an invalid username or password' },
    });
  }
});

router.post('/users/login/facebook', async (req, res) => {
  const { email, userID, name } = req.body;
  const nameArray = name.split(' ');

  const user = await User.findOne({ facebook: userID });
  if (!user) {
    const newUser = new User({
      name,
      username: nameArray.join('') + userID,
      email,
      facebook: userID,
    });
    try {
      await newUser.save();
      const token = await newUser.generateAuthToken();
      res.status(201).send({ user: newUser, token });
    } catch (e) {
      res.status(400).send(e);
    }
  } else {
    const token = await user.generateAuthToken();
    res.send({ user, token });
  }
});

// PERBAIKAN GOOGLE LOGIN (VERSI BACKEND)
router.post('/users/login/google', async (req, res) => {
  try {
    const { accessToken } = req.body;

    // 1. Verifikasi accessToken ke Google API
    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );
    
    const { email, sub: googleId, name, picture } = googleRes.data;

    // 2. Cek apakah user sudah ada di database
    let user = await User.findOne({ google: googleId });

    if (!user) {
      // 3. Jika belum ada, buat user baru (Auto-Register)
      const nameArray = name.split(' ');
      user = new User({
        name,
        username: nameArray.join('').toLowerCase() + googleId.substring(0, 5),
        email,
        google: googleId,
        imageurl: picture
      });
      await user.save();
    }

    // 4. Generate Token aplikasi kamu sendiri
    const token = await user.generateAuthToken();
    res.send({ user, token });

  } catch (e) {
    console.error('Google Auth Error:', e);
    res.status(400).send({
      error: { message: 'Google authentication failed' }
    });
  }
});

// Logout user
router.post('/users/logout', auth.simple, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send({});
  } catch (e) {
    res.status(400).send(e);
  }
});

// Sisanya kode logoutAll, get users, dll tetap sama...
// (Pastikan semua rute di bawah ini tetap ada sampai module.exports)

// Logout all
router.post('/users/logoutAll', auth.enhance, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get all users
router.get('/users', auth.enhance, async (req, res) => {
  if (req.user.role !== 'superadmin')
    return res.status(400).send({
      error: 'Only the god can see all the users!',
    });
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(400).send(e);
  }
});

// User infos
router.get('/users/me', auth.simple, async (req, res) => {
  try {
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get user by id only for admin
router.get('/users/:id', auth.enhance, async (req, res) => {
  if (req.user.role !== 'superadmin')
    return res.status(400).send({
      error: 'Only the god can see the user!',
    });
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    if (!user) return res.sendStatus(404);
    res.send(user);
  } catch (e) {
    res.sendStatus(400);
  }
});

// Edit/Update user
router.patch('/users/me', auth.simple, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'phone', 'username', 'email', 'password'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates!' });

  try {
    const { user } = req;
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Admin can update user by id
router.patch('/users/:id', auth.enhance, async (req, res) => {
  if (req.user.role !== 'superadmin')
    return res.status(400).send({
      error: 'Only the god can update the user!',
    });
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'phone', 'username', 'email', 'password', 'role'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates!' });

  try {
    const user = await User.findById(_id);
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    if (!user) return res.sendStatus(404);
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete by id
router.delete('/users/:id', auth.enhance, async (req, res) => {
  if (req.user.role !== 'superadmin')
    return res.status(400).send({
      error: 'Only the god can delete the user!',
    });
  const _id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(_id);
    if (!user) return res.sendStatus(404);
    res.send({ message: 'User Deleted' });
  } catch (e) {
    res.sendStatus(400);
  }
});

router.delete('/users/me', auth.simple, async (req, res) => {
  if (req.user.role === 'superadmin')
    return res.status(400).send({
      error: 'You cannot delete yourself!',
    });
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.sendStatus(400);
  }
});

module.exports = router;