/* istanbul ignore file */
import mongoose from 'mongoose';
import lodash from 'lodash';
import uniqueValidator from 'mongoose-unique-validator';
import moment from 'moment';
import mongoose_delete from './utils/soft-delete.cjs';

const { isEmpty } = lodash;

/**
 * Gets the User Model
 * @param {mongoose.Connection} connection the mongoose connection
 * @returns {mongoose.Model} — The compiled model
 */
const getUser = connection => {
  const { Schema } = mongoose;

  const schemaOptions = {
    timestamps: true,
    runSettersOnQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
  const schema = new Schema(
    {
      username: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        index: true,
      },
      hash: {
        type: String,
        select: false,
      },
    },
    schemaOptions);


  function generate(data) {
    /* istanbul ignore next */
    if (isEmpty(data)) {
      throw new Error('User data is required');
    }

    try {
      const user = new this();
      // This is where we would add stuff like fname, lname, email, etc ...
      ['_id', 'username', 'hash'].forEach(x => {
        if (data.hasOwnProperty(x)) {
          user[x] = data[x];
        }
      });

      return user;
    } catch (err) {
      /* istanbul ignore next */
      throw err;
    }
  }

  schema.statics.generate = generate;

  schema.plugin(uniqueValidator, { message: 'username is already taken.' });
  schema.plugin(mongoose_delete, {
    deletedAt: true,
    indexFields: 'all',
    overrideMethods: 'all',
    deletedBy: true,
  });

  return connection.model('User', schema, 'users');
};

/**
 * Convert a User model to a JSON representation
 * Use user-dto to return the user externally.
 * @param {Object} user User model to extract data from
 * @param {...string} extraProps Extra User properties to include in returned JSON
 */
export const userToJSON = (user, ...extraProps) => {
  const authUser = (user.authUser != null) ? {
    id: user.authUser.id,
    username: user.authUser.username,
  } : undefined;

  return {
    id: user._id.toString(),
    createdAt: moment(user.createdAt).format('YYYY-MM-DD'),
    authUser,

    ...extraProps.reduce((acc, prop) => ({ ...acc, [prop]: user[prop] }), {}),
  };
};


export default getUser;