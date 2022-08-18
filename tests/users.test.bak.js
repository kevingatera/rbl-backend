import supertest from 'supertest';
import { v4 as uuidv4 } from 'uuid';

import startServer from '../src/start';

let apiServer;
let request;

describe("POST /register", () => {

  beforeAll(async () => {
    jest.setTimeout(10000);
    apiServer = await startServer(process.env.PORT).catch(err => {
      log.error('[server][start]', err);
      process.kill(process.pid);
    });
    request = supertest(apiServer);

    // Allow time for mongo to connect
    await new Promise((r) => setTimeout(r, 1000));
  });

  afterAll(async () => {
    // Cleanup after yourself!.
    await apiServer.shutdown();
  })

  describe("With preexisting username & valid/invalid password", () => {

    test("should respond with a 409 status code", async () => {
      const response = await request.post("/api/users/register").send({
        username: "testuser",
        password: "password123",
      })
      expect(response.statusCode).toBe(409);
      expect(response.body.error).toBe("Username already exists");
    })

  });

  describe("With valid username & valid password", () => {
    // TODO: Should save the username & password to db
    // TODO: Should respond with  a json object containing the user id

    test("should respond with a 201 status code", async () => {
      const response = await request.post("/api/users/register").send({
        username: `testuser${uuidv4()}`,
        password: "password123"
      })
      expect(response.statusCode).toBe(201)
    })

    test("should specify json in the content type header", async () => {
      const response = await request.post("/api/users/register").send({
        username: `testuser${uuidv4()}`,
        password: "password123"
      })
      expect(response.headers['content-type']).toEqual(expect.stringContaining("plain"))
    })
  })


  describe("With valid username & no password", () => {
    // TODO: Should NOT save to db
    // TODO: Should respond with  a json object containing the user id

    test("should respond with a 422 status code", async () => {
      const response = await request.post("/api/users/register").send({
        username: `testuser${uuidv4()}`,
      });
      expect(response.statusCode).toBe(422);
      expect(response.body.errorKey).toBe("INVALID_REQUEST");
    });

  });

  describe("With no username & invalid password", () => {

    test("should respond with a 422 status code", async () => {
      const response = await request.post("/api/users/register").send({
        password: "password123",
      })
      expect(response.statusCode).toBe(422)
    })

  });

  describe("With preexisting username & valid/invalid password", () => {

    test("should respond with a 409 status code", async () => {
      const response = await request.post("/api/users/register").send({
        username: "testuser",
        password: "password123",
      })
      expect(response.statusCode).toBe(409);
      expect(response.body.error).toBe("Username already exists");
    })

  });


});

