import 'express-session';

declare module 'express-session' {
  interface SessionData {
    twitchAuthFlow?: 'login' | 'reauth';
  }
}
