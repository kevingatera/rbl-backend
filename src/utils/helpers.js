/* istanbul ignore file */
import log from 'loglevel';

// Process Utils for Node
const shutdownFactory = signal => (onSignal, done = () => {}) => {
  const cleanup = async () => {
    try {
      await onSignal();
      log.info('[shutdown]');
      process.removeListener(signal, cleanup);
      process.kill(process.pid, signal);
      done(); // for async testing
    } catch (error) {
      log.error('[shutdown]', error);
      process.exit(1);
      done(); // for async testing
    }
  };
  process.on(signal, cleanup);
};

export const onSIGINT = shutdownFactory('SIGINT');
export const onSIGTERM = shutdownFactory('SIGTERM');
export const onSIGUSR2 = shutdownFactory('SIGUSR2');

// Time conversion utils
const ONE_MINUTE = 60 * 1000;
export const minutes = n => n * ONE_MINUTE;
export const hours = n => minutes(n * 60);
export const days = n => hours(n * 24);
export const weeks = n => days(n * 7);
export const years = n => weeks(n * 52);


export default {
  onSIGTERM,
  onSIGINT,
  onSIGUSR2,
};
