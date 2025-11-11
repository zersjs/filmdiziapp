import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';
import logger from './logger.js';

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id).select('-password');

      if (!user) {
        return done(null, false);
      }

      if (!user.isActive) {
        return done(null, false, { message: 'Account is deactivated' });
      }

      return done(null, user);
    } catch (error) {
      logger.error(`JWT Strategy Error: ${error.message}`);
      return done(error, false);
    }
  })
);

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.ENABLE_SOCIAL_LOGIN === 'true') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await User.findOne({
            $or: [
              { googleId: profile.id },
              { email: profile.emails[0].value }
            ]
          });

          if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
            fullName: profile.displayName,
            avatar: profile.photos[0]?.value,
            isEmailVerified: true,
            authProvider: 'google',
          });

          logger.info(`New user registered via Google: ${user.email}`);
          return done(null, user);
        } catch (error) {
          logger.error(`Google OAuth Error: ${error.message}`);
          return done(error, false);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.ENABLE_SOCIAL_LOGIN === 'true') {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await User.findOne({
            $or: [
              { facebookId: profile.id },
              { email: profile.emails?.[0]?.value }
            ]
          });

          if (user) {
            // Update Facebook ID if not set
            if (!user.facebookId) {
              user.facebookId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            facebookId: profile.id,
            email: profile.emails?.[0]?.value || `fb_${profile.id}@sinefix.com`,
            username: (profile.emails?.[0]?.value?.split('@')[0] || `user_${profile.id}`) + '_' + Date.now(),
            fullName: `${profile.name.givenName} ${profile.name.familyName}`,
            avatar: profile.photos?.[0]?.value,
            isEmailVerified: true,
            authProvider: 'facebook',
          });

          logger.info(`New user registered via Facebook: ${user.email}`);
          return done(null, user);
        } catch (error) {
          logger.error(`Facebook OAuth Error: ${error.message}`);
          return done(error, false);
        }
      }
    )
  );
}

export default passport;
