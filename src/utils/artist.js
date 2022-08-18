import { Artist } from "../models/index.js";

/**
 * Persist a Artist document
 * @param {Object} artistInfo Info of artist to be created
  */
export const createArtist = async (artistInfo) => {
  let artist = Artist.generate(artistInfo);
  
  artist = await artist.save();

  return artist;
};
