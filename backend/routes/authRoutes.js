const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const user = req.user;
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

  const redirectUrl = `http://localhost:3000/login-success?token=${token}&name=${encodeURIComponent(user.name)}`;
  res.redirect(redirectUrl);
});

module.exports = router;