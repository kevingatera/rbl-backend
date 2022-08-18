/* istanbul ignore file */
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';

import { User } from '../models/index.js';
import SessionUser from './session-user.js';

const AUTH_FIELDS = {
  usernameField: 'username',
  passwordField: 'password',
};

/**
 * Passport Local Strategy used to authentify users. It verifies user exists,
 * password matches and that user has a valid Chargebee subscription.
 */
const localStrategy = new LocalStrategy(AUTH_FIELDS, async (username, password, done) => {
  try {
    let user = await User.findOne({ username }).select('+hash');

    // Return a standard 401 if the user doesn't exist
    if (!user || user.deleted) {
      return done(null, false, { errorKey: 'WRONG_CREDENTIALS' });
    }

    // Verify if the password matches
    const match = await bcrypt.compare(password, user.hash)
    
    if (!match) {
      // TODO: Increment the fail count
      // TODO: Lock the user if it had too many failed attempts 
      // TODO: Unlock user if the last attempt was too long ago

      // Return a standard 401
      await user.save();
      return done(null, false, { errorKey: 'WRONG_CREDENTIALS' });
    }

    // At this point, Login was successful

    // TODO GROUPS -- Use same process as getMe + populate enteprise
    const userObj = {
      ...user.toObject(),
      id: user._id.toString(),
    }

    return done(null, userObj);
  } catch (err) {
    return done(err);
  }
});

/**
 * Passport method used after running Local Strategy. It will serialize
 * the user object into the session object. This will be attached to req.user
 * in subsequent authenticated API requests
 * @param {Object} user User retrieved from Local Strategy
 */
const serializeUser = (user, done) => {
  done(null, {
    id: user.id,
    username: user.username,
  });
};

/**
 * Passport method used to attach session user object to req.user
 * @param {*} sessionUser User object stored into session 
 */
const deserializeUser = async (sessionUser, done) => {
  const deserializedUser = await SessionUser.build(sessionUser);
  done(null, deserializedUser);
};

export default {
  localStrategy,
  serializeUser,
  deserializeUser,
};
