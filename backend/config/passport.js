const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/api/auth/google/callback'
},
  async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const name = profile.displayName;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return done(err);

      if (results.length > 0) {
        return done(null, results[0]); // deja exista
      } else {
        db.query(
          'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
          [name, email, 'user'],
          (err, result) => {
            if (err) return done(err);
            const user = { id: result.insertId, name, email, role: 'user' };
            return done(null, user);
          }
        );
      }
    });
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
