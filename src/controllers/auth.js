/* istanbul ignore file */
import log from 'loglevel';
import Passport from 'passport';

import { HttpException } from '../middleware/errors';

import userDTO from '../models/dtos/userDTO';

const login = async (req, res, next) => {
  Passport.authenticate('local', (err, user, info) => {
    if (err) {
      log.error(err);
      return next(new HttpException(500, "DEFAULT_ERROR"));
    }

    if (!user && info) {
      return next(new HttpException(401, info.errorKey));
    }
    // Use regenerate to create a new session cookie on each login
    req.session.regenerate(err => {
      if (err) {
        return next(new HttpException(500, "DEFAULT_ERROR"));
      }

      req.login(user, async (err) => {
        if (err) {
          log.error(err);
          return next(new HttpException(500, "DEFAULT_ERROR"));
        }

        user = {
          authUser: req.authUser,
          ...user  
        }

        const userObject = await userDTO(user, null);

        return res.json({ data: userObject });
      });
    });
  })(req, res, next);
};

export default {
  login
};
