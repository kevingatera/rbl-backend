/* istanbul ignore file */
import mongoose from 'mongoose';
import Joi from 'joi';
import bcrypt from 'bcrypt';

import { User } from '../models/index.js';
import { createUser } from '../utils/user.js';

import { HttpException } from '../middleware/errors.js';


// controller methods
/**
 * Register handler that validates and creates a User
 */
const register = async (req, res) => {
  const bodySchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }).required();

  const { error, value } = bodySchema.validate(req.body);

  if (error) {
    throw new HttpException(400, "BAD_REQUEST", error.message);
  }

  let { username, password } = value;

  const hash = await bcrypt.hash(password, 10)

  const userInfo = {
    _id: mongoose.Types.ObjectId(),
    username,
    hash
  };

  //Check if username exists
  const dbUser = await User.findOne({ username }, { _id: true }).lean();
  if (dbUser) {
    return res.status(409).send({ error: 'Username already exists' });
  };

  // Create the user in database
  await createUser(userInfo);

  // TODO: This is where we should send the sign up email

  res.sendStatus(201);
};

export default {
  register,
};
