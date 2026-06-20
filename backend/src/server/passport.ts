import type { Request } from 'express';
import passport from 'passport';
import { Strategy as TwitchStrategy } from 'passport-twitch-new';
import UserService from '../database/lib/user';
import logger from '../logger';
import { updateUserToken } from '../token';
import * as tokenServices from '../tokenServices';

const allowedIds = process.env.ALLOWED_IDS.split(',').map((x) => x.trim());
const broadcasterId = allowedIds[0];

interface TwitchProfile {
  id: string;
}

type Done = (error: Error | null, user?: string | false, info?: { message: string }) => void;

passport.use(
  new TwitchStrategy(
    {
      clientID: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      callbackURL: process.env.TWITCH_CALLBACK_URL,
      scope: '',
      passReqToCallback: true,
    },
    async (
      req: Request,
      accessToken: string,
      _refreshToken: string,
      profile: TwitchProfile,
      done: Done,
    ) => {
      if (!allowedIds.includes(profile.id)) return done(null, false, { message: 'Not allowed.' });
      if (req.session?.twitchAuthFlow === 'reauth' && profile.id !== broadcasterId) {
        return done(null, false, { message: 'Broadcaster reauthorization required.' });
      }

      try {
        if (req.session?.twitchAuthFlow === 'reauth') {
          await updateUserToken(accessToken);
          await tokenServices.start().catch((error: Error) => {
            logger.error(
              `Failed to start Twitch token-dependent services after reauth: ${error.message}`,
            );
          });
        }
        const user = await UserService.updateProfile(profile);
        done(null, user.twitchId);
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Unknown Twitch auth error');
        logger.error(
          `Twitch ${req.session?.twitchAuthFlow || 'login'} failed for user ${profile.id}: ${error.message}`,
        );
        done(error, false);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: string, done) => {
  done(null, user);
});

export default passport;
