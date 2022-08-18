/* istanbul ignore file */

import log from 'loglevel';
import startServer from './start.js';

log.setLevel("info");

const server = async () => {
  return await startServer(process.env.PORT).catch(err => {
    log.error('[server][start]', err);
    process.kill(process.pid);
  });
};

export default server;

// Start the server
await server();
