const jwt = require('jsonwebtoken');
const User = require('../models/user');

const simple = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    // Pakai process.env agar konek ke file .env kamu
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mySecret');
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });
    if (!user) throw new Error();
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

const enhance = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mySecret');
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });
    // KITA UBAH DISINI: admin juga boleh lewat, nggak harus superadmin
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) throw new Error();
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = { simple, enhance };