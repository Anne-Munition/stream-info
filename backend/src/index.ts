import * as app from './app';
import logger from './logger';

logger.info('Application starting...');

app
  .start()
  .then(() => {
    logger.info('Startup complete');
  })
  .catch((err) => {
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
  app.stop().finally(() => {
    logger.info(`Shutdown completed. Exiting.`);
    process.exit(0);
  });
};
