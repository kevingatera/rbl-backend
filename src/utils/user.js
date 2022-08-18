/* istanbul ignore file */
import { User } from "../models/index.js";

/**
 * Persist a User document
 * @param {Object} userInfo Info of user to be created
  */
 export const createUser = async (userInfo) => {
  let user = User.generate(userInfo);

  user = await user.save();

  return {
    user: user
  };
};
