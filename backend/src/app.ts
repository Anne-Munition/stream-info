import * as database from './database';
import * as emotes from './emotes';
import twitchEmoteTimer from './emotes/twitch';
import logger from './logger';
import * as server from './server';
import * as streamelements from './streamelements';
import * as appToken from './twitch/twitch_app_token';
import eventSub from './twitch/twitch_eventsub';
import * as twitchIrc from './twitch/twitch_irc';
import * as twitchPolling from './twitch/twitch_polling';
import './reddit';

async function start(): Promise<void> {
  await appToken.init();
  await database.connect();
  await emotes.init();
  twitchEmoteTimer.start();
  await streamelements.init();
  await twitchIrc.connect();
  server.start();
  twitchPolling.start();
  // await eventSub.subscribe();
}

async function stop(): Promise<void> {
  const shutdownSequence = [
    twitchPolling.stop,
    server.stop,
    twitchIrc.disconnect,
    streamelements.stop,
    twitchEmoteTimer.stop,
    database.disconnect,
  ];

  for (let i = 0; i < shutdownSequence.length; i++) {
    try {
      await shutdownSequence[i]();
    } catch (e) {
      logger.error(e);
    }
  }
}

export default {
  start,
  stop,
};
