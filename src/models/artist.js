import mongoose from 'mongoose';
import lodash from 'lodash';
import moment from 'moment';
import mongoose_delete from './utils/soft-delete.cjs';

const { isEmpty } = lodash;
const SPOTIFY_INCEPTION_DATE = '04/01/2006';


export const PAID_STATUS_TYPE = Object.freeze({
  PAID: 'PAID',
  UNPAID: 'UNPAID'
});

/**
 * Gets the Artist Model
 * @param {mongoose.Connection} connection the mongoose connection
 * @returns {mongoose.Model} — The compiled model
 */
const getArtist = connection => {
  const { Schema } = mongoose;
  const { ObjectId } = Schema.Types;

  const schemaOptions = {
    timestamps: true,
    runSettersOnQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
  const schema = new Schema(
    {
      name: {
        type: String,
        unique: true,
        required: true,
      },
      rate: {
        type: Number,
        required: true,
      },
      streams: {
        type: Number,
        default: 0,
      },
      paidStreams: {
        type: Number,
        default: 0,
      },
      createdBy: {
        type: ObjectId,
        ref: 'User',
        required: true,
      },
      lastPaidAt: { 
        type: Date
      },
      lastPaidBy: { 
        type: Date
      },
    },
    schemaOptions);


  /* istanbul ignore next */
  function generate(data) {
    if (isEmpty(data)) {
      throw new Error('Artist data is required');
    }

    try {
      const artist = new this();
      ['_id', 'name', 'rate', 'createdBy'].forEach(x => {
        if (data.hasOwnProperty(x)) {
          artist[x] = data[x];
        }
      });

      return artist;
    } catch (err) {
      throw err;
    }
  }

  schema.statics.generate = generate;

  schema.plugin(mongoose_delete, {
    deletedAt: true,
    indexFields: 'all',
    overrideMethods: 'all',
    deletedBy: true,
  });

  return connection.model('Artist', schema, 'artists');
};

const calculateAvgMonthly = (artist) => {
  
  const monthsSinceInception = moment(artist.lastPaidAt).diff(new Date(SPOTIFY_INCEPTION_DATE), 'months');
  const averageMonthly = (artist.rate * artist.paidStreams) / monthsSinceInception;

  return parseFloat(averageMonthly.toFixed(2));
}

/**
 * Convert a Artist model to a JSON representation
 * Use artist-dto to return the artist externally.
 * @param {Object} artist Artist model to extract data from
 * @param {...string} extraProps Extra Artist properties to include in returned JSON
 */
export const artistToJSON = (artist, ...extraProps) => {

  const unpaid = moment().diff(artist.lastPaidAt, 'd') > 14 && artist.streams > artist.paidStreams;

  return {
    id: artist._id.toString(),
    updatedAt: moment(artist.updatedAt),
    lastPaidAt: moment(artist.lastPaidAt).calendar(),
    name: artist.name,
    rate: artist.rate,
    streams: artist.streams,
    avgMonthly: calculateAvgMonthly(artist),
    paidStatus: unpaid ? PAID_STATUS_TYPE.UNPAID : PAID_STATUS_TYPE.PAID,
    paidStreams: artist.paidStreams,
    lastPaidBy: artist.lastPaidBy,
    ...extraProps.reduce((acc, prop) => ({ ...acc, [prop]: artist[prop] }), {}),
  };
};


export default getArtist;
