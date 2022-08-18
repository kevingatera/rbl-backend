import mongoose from 'mongoose';
import Joi from 'joi';

import { createArtist } from '../utils/artist.js';

import { HttpException } from '../middleware/errors.js';

import { Artist } from '../models/index.js';
import artistDTO from '../models/dtos/artistDTO.js';

// controller methods
/**
 * Create handler that validates and creates a artist
 */
const create = async (req, res) => {
  
  const bodySchema = Joi.object({
    name: Joi.string().required(),
    rate: Joi.number().required().precision(6).min(0) // limit: 0.000001
  }).required();

  const { error, value } = bodySchema.validate(req.body);
  
  if (error) {
    throw new HttpException(400, "BAD_REQUEST");
  }

  let { name, rate } = value;
  
  
  const newArtist = {
    _id: mongoose.Types.ObjectId(),
    name: name,
    rate: rate,
    createdBy: mongoose.Types.ObjectId(req.authUser.id)
  };
  
  // Create artist in database
  const artist = await createArtist(newArtist);

  const artistObject = await artistDTO(artist, null);

  return res.status(201).json({ artist: artistObject })
};

const update = async (req, res) => {
  const { artistId } = req.params;

  const bodySchema = Joi.object({
    name: Joi.string().required(),
    rate: Joi.number().required().precision(6).min(0) // limit: 0.000001
  }).required();
  const { error, value } = bodySchema.validate(req.body['artist']);
  
  if (error) {
    throw new HttpException(400, "BAD_REQUEST");
  }

  let { name, rate } = value;

  let artist = await Artist.findOne({
    _id: mongoose.Types.ObjectId(artistId)
  }).lean();

  // Return a standard 401 if the artist doesn't exist 
  if (!artist || artist.deleted) {
    throw new HttpException(404, "ARTIST_NOTFOUND");
  }

  // Update artist in database
  await Artist.updateOne({
    _id: mongoose.Types.ObjectId(artistId)
  }, {
    $set: {
      name: name,
      rate: rate
    }
  });

  return res.json({ artistId: artist._id.toString() });
};


const payout = async (req, res) => {
  const { artistId } = req.params;

  let artist = await Artist.findOne({
    _id: mongoose.Types.ObjectId(artistId)
  }).lean();

  // Return a standard 401 if the artist doesn't exist 
  if (!artist || artist.deleted) {
    throw new HttpException(404, "ARTIST_NOTFOUND");
  }

  // Update artist in database
  await Artist.updateOne({
    _id: mongoose.Types.ObjectId(artistId)
  }, {
    $set: {
      paidStreams: artist.streams,
      paidBy: mongoose.Types.ObjectId(req.authUser.id),
      lastPaidAt: Date.now()
    }
  });

  return res.json({ artistId: artist._id.toString(), paidStreams: artist.streams });
};

const changeRate = async (req, res) => {
  const { artistId } = req.params;

  let artist = await Artist.findOne({
    _id: mongoose.Types.ObjectId(artistId)
  }).lean();

  // Return a standard 401 if the artist doesn't exist 
  if (!artist || artist.deleted) {
    throw new HttpException(404, "ARTIST_NOTFOUND");
  }
  
  const querySchema = Joi.object({
    newRate: Joi.number().required().precision(6).min(0) // limit: 0.000001
  }).required();
  const { error } = querySchema.validate(req.query);
  
  if (error) {
    throw new HttpException(400, "BAD_REQUEST");
  
  }

  const newRate = parseFloat(req.query['newRate']);
  if (artist.rate === newRate) {
    throw new HttpException(304, "NOT_MODIFIED");
  }

  // Update artist in database
  await Artist.updateOne({
    _id: mongoose.Types.ObjectId(artistId)
  }, {
    $set: {
      rate: newRate
    }
  });

  return res.json({ artistId: artist._id.toString() });
};

const deleteById = async (req, res) => {
  const { artistId } = req.params;
  
  let artist = await Artist.findOne({
    _id: mongoose.Types.ObjectId(artistId)
  }).lean();
  
  // Return a standard 404 if the user doesn't exist
  if (!artist || artist.deleted) {
    throw new HttpException(404, "ARTIST_NOTFOUND");
  }

  // we are performing a soft-delete
  await Artist.updateOne({
    _id: mongoose.Types.ObjectId(artistId)
  }, {
    $set: {
      deleted: true
    }
  });

  return res.json({ artistId: artist._id.toString() });
};

const getById = async (req, res) => {
  const { artistId } = req.params;

  let artist = await Artist.findOne({
    _id: mongoose.Types.ObjectId(artistId),
  }).lean();

  // Return a standard 404 if the user doesn't exist
  if (!artist || artist.deleted) {
    throw new HttpException(404, "ARTIST_NOTFOUND");
  }

  const artistObject = await artistDTO(artist, null);

  return res.json({ artist: artistObject })
};

const get = async (req, res) => {

  let artists = await Artist.find({
    deleted: false
  }).lean();

  const artistObjects = [];
  for (const artist of artists) {
    artistObjects.push(await artistDTO(artist, null));
  }

  return res.json({ artists: artistObjects });
};

export default {
  create,
  update,
  payout,
  changeRate,
  deleteById,
  getById,
  get
};
