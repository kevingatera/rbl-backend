/* istanbul ignore file */
import { userToJSON } from "../user";

/**
 * Convert a User model to a safe JSON representation for the UI
 * @param {Object} user User model to extract data from
 * @param {...string} extraProps Extra User properties to include in returned JSON
 */
const userDTO = async (user, ...extraProps) => {
  try {
    return {
      ...userToJSON(user, extraProps)
    };
  } catch (err) {
    // TODO: Place logging here
    return null;
  }
};

export default userDTO;
