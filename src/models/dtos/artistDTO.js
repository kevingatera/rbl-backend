import { artistToJSON } from "../artist";

/**
 * Convert a Artist model to a safe JSON representation for the UI
 * @param {Object} artist Artist model to extract data from
 * @param {...string} extraProps Extra Artist properties to include in returned JSON
 */
const artistDTO = async (artist, ...extraProps) => {
  try {
    return {
      ...artistToJSON(artist, extraProps)
    };
  } catch (err) {
    // TODO: Place logging here
    /* istanbul ignore next */
    return null;
  }
};

export default artistDTO;
