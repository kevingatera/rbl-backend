import express from 'express';
import supertest from 'supertest';
import 'express-async-errors';
import fs from 'fs';

import required from '@app/middleware/required';
import setupRoutes from '@app/routes/index';
import { Artist } from '@app/models/index';
import bodyParser from 'body-parser';
import { httpErrorHandler } from '@app/middleware/errors';

let apiServer;
let request;
let authUser = {
  "id": "62cdb64281e8f36ae02cab28",
  "username": "testuser"
};

const rawdata = fs.readFileSync('tests/__mocks__/roster.mock.json');
const artistsDataMock = JSON.parse(rawdata);

const testArtist = {
  name: "2PAC Shakur",
  rate: (5 / 1000)
}

describe("PATCH /artists", () => {

  beforeAll(async () => {

    // mock authentication
    required.auth = jest.fn((req, res, next) => next());

    apiServer = express();
    // For understanding json
    apiServer.use(bodyParser.json());
    apiServer.use(bodyParser.urlencoded({extended: true}));
    // append custom authUser
    apiServer.use(async (req, res, next) => { 
      req.authUser = authUser;
      next()
    }); 

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
    
    Artist.updateOne = jest.fn().mockImplementation(( { _id } ) => Promise.resolve(artistsDataMock.find(a => a["_id"] == _id.toString())));

    Artist.generate = jest.fn(function (artistInfo) {
      return ({
        ...artistInfo,
        save: jest.fn().mockReturnValue(artistInfo), // mock save
      });
    });

  });

  describe("With valid data", () => {
    test("should respond with a 200 status code", async () => {
      const response = await request.post(`/api/artists`).send({
        name: testArtist.name,
        rate: testArtist.rate
      });
      expect(response.statusCode).toBe(201)
      expect(response.body.artist.id).toBeDefined();
    })

    test("should specify json in the content type header", async () => {
      const response = await request.post(`/api/artists`).send({
        name: testArtist.name,
        rate: testArtist.rate
      });
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
    })
  })

  describe("With valid artist, no rate", () => {
    test("should respond with a 400 status code", async () => {
      const response = await request.post(`/api/artists`).send({
        name: testArtist.name,
      })
      expect(response.statusCode).toBe(400);
      expect(response.body.errorKey).toBe("BAD_REQUEST");
    })
  })

  describe("With valid rate, no name", () => {
    test("should respond with a 400 status code", async () => {
      const response = await request.post(`/api/artists`).send({
        rate: testArtist.rate,
      })
      expect(response.statusCode).toBe(400);
      expect(response.body.errorKey).toBe("BAD_REQUEST");
    })
  })

});

