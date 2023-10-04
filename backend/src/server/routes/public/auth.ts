import express from 'express';
import { validate as validateToken } from '../../../token';
import passport from '../../passport';
import refreshUserToken from '../../services/refreshUserToken';

const router = express.Router();
const appUrl = process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:8080/';

// BASE/auth/login
router.get('/login', passport.authenticate('twitch'));

// BASE/auth/callback
router.get(
  '/callback',
  passport.authenticate('twitch', {
    successRedirect: appUrl,
    failureRedirect: `${appUrl}unauthorized`,
  }),
);

// BASE/auth/logout
router.get('/logout', (req, res, next) => {
  req.session.destroy(function () {
    res.redirect(`${appUrl}logout`);
  });
});

// BASE/auth/token/renew
router.get('/token/renew', (req, res, next) => {
  try {
    const url = refreshUserToken.accessRequestUrl();
    res.redirect(url);
  } catch (e) {
    next(e);
  }
});

// BASE/auth/token/renew/callback
router.get('/token/renew/callback', async (req, res, next) => {
  const { code } = req.query;
  if (!code) {
    res.sendStatus(400);
    return;
  }
  try {
    const url = refreshUserToken.tokenRequestUrl(code as string);
    const token = await refreshUserToken.getNewToken(url);
    await refreshUserToken.storeToken(token);
    await validateToken();
    res.redirect(appUrl);
  } catch (e) {
    next(e);
  }
});

export default router;
