import path from 'path';
import express from 'express';
// import helmet from 'helmet';
import morgan from 'morgan';
import { emotesDir } from '../directories';
import logger, { stream } from '../logger';
import passport from './passport';
import Api from './routes';
import sessionStore from './sessionStore';

const app = express();

/*app.use(
  helmet({
    contentSecurityPolicy: false, // TODO: figure out specifics for VUE
  }),
);*/

const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(format, { stream: stream }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// @ts-ignore
app.use(sessionStore);
// @ts-ignore
app.use(passport.initialize());
// @ts-ignore
app.use(passport.session());

app.use('/api', Api);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err?.code === 'TWITCH_TOKEN_INVALID') {
    res.status(401).json({
      code: err.code,
      message: 'Twitch broadcaster token is invalid. Reauthorization required.',
    });
    return;
  }

  logger.error(err?.stack || err?.message || err);
  res.status(err?.status || 500).json({
    message: err?.message || 'Internal Server Error',
  });
});

app.use('/emotes', express.static(emotesDir));

if (process.env.NODE_ENV === 'production') {
  const wwwDir = path.join(__dirname, '../../../frontend/dist');

  app.get('/', (req, res, next) => {
    if (!req.isAuthenticated()) {
      res.redirect('/api/auth/login');
      return;
    }
    res.sendFile(path.join(wwwDir, 'index.html'));
  });

  app.use(express.static(wwwDir));

  app.all('*', (req, res, next) => {
    res.sendFile(path.join(wwwDir, 'index.html'));
  });
}

export default app;
