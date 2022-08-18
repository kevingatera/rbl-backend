/* istanbul ignore file */
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import 'express-async-errors';
import log from 'loglevel';
import stoppable from 'stoppable';
import MongoStore from 'connect-mongo';

import dotenv from 'dotenv';

import setupRoutes from './routes/index.js';
import { onSIGINT, onSIGTERM, onSIGUSR2, hours } from '../src/utils/helpers.js';
import { mongooseConnection, Mongoose } from './models/index.js';
import authUtils from '../src/utils/auth.js';
import { httpErrorHandler } from './middleware/errors.js';


const ENV = { ...process.env };
const { parsed = {}, error } = dotenv.config();

if (error) {
  log.error(`Could not parse .env file: ${error}`);
}

const config = { ...ENV, ...parsed };

const app = express();

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');

(async () => await mongooseConnection.openUri(config.MONGODB_URI, { useNewUrlParser: true }))();

const mongoStore = MongoStore.create(mongooseConnection)

const sessionOptions = {
  store: mongoStore,
  name: `test-${config.ENV_NAME}.sid`,
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: hours(4),
    httpOnly: true,
    domain: config.NODE_ENV === 'production' && config.cookieDomain,
  },
};

app.use(session(sessionOptions));
app.use((req, res, next) => {
  if (!req.session) {
    return next(new Error('no session'));
  }
  return next();
});

app.use(passport.initialize({ userProperty: 'authUser' }));
app.use(passport.session());

passport.serializeUser(authUtils.serializeUser);
passport.deserializeUser(authUtils.deserializeUser);
passport.use(authUtils.localStrategy);

setupRoutes(app);

// HTTP error handler
app.use(httpErrorHandler);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  return next(err);
});

// error handler
app.use((err, req, res, next) => {
  // Delegate to default Express error handler if headers are already sent 
  if (res.headersSent) {
    return next(err);
  }

  log.error(err.stack);

  res.status(err.status || 500);

  if (req.accepts(['json']) === 'json') {
    return res.json(err.custom ? { error: err.message } : { errorKey: 'DEFAULT_ERROR' });
  }

  return next(err);
});

export const server = app;


async function start(port) {

  return new Promise(resolve => {
    const server = app.listen(port || 5000, () => {
      log.info(`[server] listening on port ${server.address().port}`);
      // For gracefully stopping the server
      stoppable(server, 2000);
      server.shutdown = () =>
        new Promise(resolveClose => {
          log.info('[server] stop');
          server.stop(async () => {
            log.info('[server] cleanup');
            Mongoose.disconnect(resolveClose);
          });
        });
      onSIGTERM(server.shutdown);
      onSIGINT(server.shutdown);
      // This is useful on my development environment
      onSIGUSR2(server.shutdown);
      resolve(server);
    });
    const keepAliveTimeout = config.keepAliveTimeout * 1000;
    server.keepAliveTimeout = keepAliveTimeout;
    // headersTimeout should always be higher than keepAliveTimeout + server response time. Adding 20s.
    server.headersTimeout = keepAliveTimeout + 20000;
  });
}

export default start;