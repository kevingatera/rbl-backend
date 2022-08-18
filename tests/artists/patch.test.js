import express from 'express';
import supertest from 'supertest';
import 'express-async-errors';
import fs from 'fs';
import { ObjectID } from 'bson';

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
const singleArtistMock = artistsDataMock[0];

const newArtistDetails = {
  name: "2PAC Shakur",
  rate: (5 / 1000)
}

describe("PATCH /artists", () => {

  beforeAll(async () => {
    
    apiServer = express();
    // For understanding json
    apiServer.use(bodyParser.json());
    apiServer.use(bodyParser.urlencoded({extended: true}));
    // mock authentication
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

  describe("/:artistId/payout", () => {
    describe("With valid artistId & valid data", () => {
      test("should respond with a 200 status code", async () => {
        const response = await request.patch(`/api/artists/${singleArtistMock._id}/payout`).send();
        expect(response.statusCode).toBe(200);
        expect(response.body.artistId).toBeDefined();
        expect(response.body.artistId).toBe(singleArtistMock._id);
        expect(response.body.paidStrams).toBe(singleArtistMock.strams);
      })
  
      test("should specify json in the content type header", async () => {
        const response = await request.patch(`/api/artists/${singleArtistMock._id}/payout`).send()
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
      })
    })
  
    describe("With valid data & invalid artistId", () => {
      test("should respond with a 404 status code", async () => {
        const response = await request.patch(`/api/artists/${(new ObjectID()).toString()}/payout`).send();
        expect(response.statusCode).toBe(404);
        expect(response.body.errorKey).toBe("ARTIST_NOTFOUND");
      })
  
      test("should specify json in the content type header", async () => {
        const response = await request.patch(`/api/artists/${singleArtistMock._id}/payout`).send()
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
      })
    })
  
  })

  describe("/:artistId/changeRate", () => {
    describe("With valid artistId & valid data", () => {
      test("should respond with a 200 status code", async () => {
        const response = await request.patch(`/api/artists/${singleArtistMock._id}/changeRate`).query({
          newRate: newArtistDetails.rate
        }).send();
        expect(response.statusCode).toBe(200);
        expect(response.body.artistId).toBeDefined();
        expect(response.body.artistId).toBe(singleArtistMock._id);
      })
  
      test("should specify json in the content type header", async () => {
        const response = await request.patch(`/api/artists/${singleArtistMock._id}/changeRate`).query({
          newRate: newArtistDetails.rate
        }).send()
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
      })
    })
  
    describe("With valid data & invalid artistId", () => {
      test("should respond with a 404 status code", async () => {
        const response = await request.patch(`/api/artists/${(new ObjectID()).toString()}/changeRate`).query({
          newRate: newArtistDetails.rate
        }).send();
        expect(response.statusCode).toBe(404);
        expect(response.body.errorKey).toBe("ARTIST_NOTFOUND");
      })
  
      test("should specify json in the content type header", async () => {
        const response = await request.patch(`/api/artists/${singleArtistMock._id}/changeRate`).query({
          newRate: newArtistDetails.rate
        }).send()
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
      })
    })
  
    describe("With valid artistId but invalid/missing data", () => {
      test("should respond with a 422 status code", async () => {
        const response = await request.patch(`/api/artists/${singleArtistMock._id}/changeRate`).query().send()
        expect(response.statusCode).toBe(422);
        expect(response.body.errorKey).toBe("INVALID_REQUEST");
      })
      test("should respond with a 400 status code", async () => {
        const response = await request.patch(`/api/artists/${singleArtistMock._id}/changeRate`).query({
          newRate: -0.003
        }).send()
        expect(response.statusCode).toBe(400);
        expect(response.body.errorKey).toBe("BAD_REQUEST");
      })
      test("should respond with a 304 status code", async () => {
        const response = await request.patch(`/api/artists/${singleArtistMock._id}/changeRate`).query({
          newRate: parseFloat(singleArtistMock.rate)
        }).send()
        expect(response.statusCode).toBe(304);
      })
    })
  })


});
