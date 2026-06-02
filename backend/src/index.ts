import logger from './logger';
import pushover from './pushover';
import * as token from './token';

logger.info('Application starting...');

pushover.init();
if (process.env.NODE_ENV === 'production') pushover.push('Starting backend.');
logger.info('Validating token');

let _app: { stop: () => Promise<void>; start: () => Promise<void> };

async function loadApp(): Promise<{ stop: () => Promise<void>; start: () => Promise<void> }> {
  return (
    require('./app') as {
      default: { stop: () => Promise<void>; start: () => Promise<void> };
    }
  ).default;
}

// Don't start the rest of the app until we get the twitch token init data
token
  .validate()
  .then(loadApp)
  .then((app) => {
    _app = app;
    return _app.start();
  })
  .then(() => {
    logger.info('Startup complete');
  })
  .catch((err: Error) => {
    logger.error(err.message);
    process.exit(1);
  });

const signals: NodeJS.Signals[] = ['SIGHUP', 'SIGINT', 'SIGTERM'];

signals.forEach((signal) => {
  process.on(signal, () => {
    shutdown(signal);
  });
});

const shutdown = (signal: NodeJS.Signals) => {
  logger.info(`Received a ${signal} signal. Attempting graceful shutdown...`);
  if (!_app) return;
  _app.stop().finally(() => {
    logger.info(`Shutdown completed. Exiting.`);
    process.exit(0);
  });
};

process.on('uncaughtException', (err) => {
  logException('uncaughtException', err);
});

process.on('unhandledRejection', (err: Error) => {
  logException('unhandledRejection', err);
});

function logException(type: string, err: Error) {
  if (err) {
    logger.error(err);
    if (err.stack) {
      pushover.push(type + '\n\n' + err.stack.split('\n').slice(0, 10).join('\n'));
    } else if (err.message) {
      pushover.push(type + '\n\n' + err.message);
    } else {
      pushover.push('An ' + type + ' has occurred.');
    }
  }
}
