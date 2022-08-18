import supertest from 'supertest';
import 'express-async-errors';
import fs from 'fs';
import { ObjectID } from 'bson';

import express from 'express';
import setupRoutes from '@app/routes/index';
import required from '@app/middleware/required';
import { httpErrorHandler } from '@app/middleware/errors';

import { Artist } from '@app/models/index';
let apiServer;
let request;

//  PUT

const rawdata = fs.readFileSync('tests/__mocks__/roster.mock.json');
const artistsDataMock = JSON.parse(rawdata);

const singleArtistMock = artistsDataMock[0];

const TOTAL_TEST_ARTISTS = artistsDataMock.length;

describe("GET /artists", () => {

  beforeAll(async () => {
    jest.setTimeout(10000);

    // mock authentication
    required.auth = jest.fn((req, res, next) => next());

    apiServer = express();
    setupRoutes(apiServer);

    // HTTP error handler
    apiServer.use(httpErrorHandler);

    request = supertest.agent(apiServer);

    Artist.find = jest.fn().mockImplementation(() => {
      return ({
        lean: jest.fn().mockReturnValue(artistsDataMock),
      });
    });
    
    Artist.findOne = jest.fn().mockImplementation(( { _id } ) => {
      return ({
        lean: jest.fn().mockReturnValue(artistsDataMock.find(a => a["_id"] == _id.toString())),
      });
    });
    

  });

  

  describe("GET /:id", () => {
    describe("With invalid artistId", () => {
      test("should respond with a 404 status code", async () => {
        const response = await request.get(`/api/artists/${(new ObjectID()).toString()}`).send();
        expect(response.statusCode).toBe(404);
        expect(response.body.errorKey).toBe("ARTIST_NOTFOUND");
      })
    })

    describe("With valid artistId", () => {
      test("should respond with a 200 status code & specify json in the content type header", async () => {
        const response = await request.get(`/api/artists/${singleArtistMock._id}`).send();
        expect(response.statusCode).toBe(200);
        expect(response.body.artist.id).toBeDefined();
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
        expect(response.body.artist.id).toBe(singleArtistMock._id);
      })
    })
  })

  describe("GET /", () => {
    test("should respond with a 200 status code & specify json in the content type header", async () => {
      const response = await request.get(`/api/artists/`).send();
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
      expect(response.body.artists).toBeDefined();
      expect(response.body.artists.length).toBe(TOTAL_TEST_ARTISTS);
      expect(response.body.artists.map(artist => artist.id)).toEqual(artistsDataMock.map(artist => artist._id));
    })
  })

});
