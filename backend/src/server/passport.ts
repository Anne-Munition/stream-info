import type { Request } from 'express';
import passport from 'passport';
import { Strategy as TwitchStrategy } from 'passport-twitch-new';
import UserService from '../database/lib/user';
import { updateUserToken } from '../token';

const allowedIds = process.env.ALLOWED_IDS.split(',').map((x) => x.trim());

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
      try {
        if (req.session?.twitchAuthFlow === 'reauth') await updateUserToken(accessToken);
        const user = await UserService.updateProfile(profile);
        done(null, user.twitchId);
      } catch (e) {
        done(e instanceof Error ? e : new Error('Unknown Twitch auth error'), false);
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
