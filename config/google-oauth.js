const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require("passport");
require("dotenv").config();
const User = require("./models/User"); // Import your User model

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      const user = await User.findOne({ googleId: profile.id });

      if (user) {
        user.name = profile.displayName;
        user.email = profile.emails[0].value;
        await user.save();
        return cb(null, user);
      } else {
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value
        });

        await newUser.save();
        return cb(null, newUser);
      }
    } catch (err) {
      return cb(err, null);
    }
  }
));

// Export the configured passport instance
module.exports = passport;
