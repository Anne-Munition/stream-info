import path from 'path';
import { Router } from 'express';
import { getLiveSubs } from '../../../twitch/twitch_polling/live_subs';

const router = Router();
const liveSubsScriptPath = path.resolve(__dirname, '../../../../public/liveSubs.js');

router.get('/live', (req, res, next) => {
  try {
    const response = getLiveSubs();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
});

router.get('/live.js', (_req, res, next) => {
  res.type('application/javascript');
  res.sendFile(liveSubsScriptPath, (err) => {
    if (err) {
      next(err);
    }
  });
});

export default router;
