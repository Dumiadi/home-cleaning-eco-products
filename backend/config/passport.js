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

    try {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return done(err);

        if (results.length > 0) {
          const existingUser = results[0];
          return done(null, {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role
          });
        } else {
          db.query(
            'INSERT INTO users (name, email, role, status, created_at) VALUES (?, ?, ?, ?, NOW())',
            [name, email, 'user', 'active'],
            (err, result) => {
              if (err) return done(err);
              const newUser = {
                id: result.insertId,
                name,
                email,
                role: 'user'
              };
              return done(null, newUser);
            }
          );
        }
      });
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
