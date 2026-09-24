const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: '/api/auth/google/callback',
      proxy: true // Required for deployment (e.g. Render/Vercel) behind proxies
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in DB
        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ]
        });

        if (user) {
          // If user exists but doesn't have googleId (signed up with email previously)
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user if doesn't exist
        user = await User.create({
          name: profile.displayName || profile.name.givenName || 'Google User',
          email: profile.emails[0].value,
          googleId: profile.id,
          role: 'student', // Default to student
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
          // Generate a dummy roll number to satisfy model if needed
          rollNumber: `G-${Date.now().toString().slice(-6)}`
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
