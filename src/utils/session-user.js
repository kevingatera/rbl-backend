/* istanbul ignore file */
import log from 'loglevel';

import { User } from '../models/index.js';
import { days } from './helpers.js';

export default class SessionUser {
  constructor(params) {
    Object.assign(this, params);
  }

  static async build(sessionUser) {
    try {
      let user = await User.findById(sessionUser.id);

      if (!user) {
        return null;
      }

      const params = {
        ...user.toObject(),
        id: user._id.toString()
      }

      // We're keeping the mongoose document reference on the request, in order run some queries further down the call tree
      params.doc = user;

      const returnedSessionUser = new SessionUser(params);
      return returnedSessionUser;
    } catch (error) {
      log.error(error);
    }
  }

};
