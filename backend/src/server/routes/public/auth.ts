import express from 'express';
import { getScopes } from '../../../token';
import passport from '../../passport';

const router = express.Router();
const appUrl = process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:8080/';

function clearAuthFlow(req: express.Request): void {
  if (req.session) req.session.twitchAuthFlow = undefined;
}

// BASE/auth/login
router.get('/login', (req, res, next) => {
  if (req.session) req.session.twitchAuthFlow = 'login';
  passport.authenticate('twitch')(req, res, next);
});

// BASE/auth/reauth
router.get('/reauth', (req, res, next) => {
  if (req.session) req.session.twitchAuthFlow = 'reauth';
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    redirect_uri: process.env.TWITCH_CALLBACK_URL,
    response_type: 'code',
    scope: getScopes().join(' '),
    force_verify: 'true',
  });

  res.redirect(`https://id.twitch.tv/oauth2/authorize?${params.toString()}`);
});

// BASE/auth/callback
router.get('/callback', (req, res, next) => {
  const authFlow = req.session?.twitchAuthFlow;

  passport.authenticate('twitch', (error: Error | null, user: string | false) => {
    if (error || !user) {
      clearAuthFlow(req);
      if (authFlow === 'reauth') {
        res.redirect(`${appUrl}reauth?error=1`);
        return;
      }
      res.redirect(`${appUrl}unauthorized`);
      return;
    }

    req.logIn(user, (loginError) => {
      clearAuthFlow(req);
      if (loginError) {
        next(loginError);
        return;
      }

      res.redirect(appUrl);
    });
  })(req, res, next);
});

// BASE/auth/logout
router.get('/logout', (req, res, next) => {
  req.session.destroy(function () {
    res.redirect(`${appUrl}logout`);
  });
});

export default router;
