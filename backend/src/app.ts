import * as database from './database';
import twitchEmoteTimer from './emotes/twitch';
import logger from './logger';
import * as server from './server';
import * as streamelements from './streamelements';
import * as tokenServices from './tokenServices';
import * as appToken from './twitch/twitch_app_token';
import eventSub from './twitch/twitch_eventsub';
import './reddit';

async function start(): Promise<void> {
  await appToken.init();
  await database.connect();
  server.start();
  twitchEmoteTimer.start();
  await streamelements.init();
  await tokenServices.start();
  // await eventSub.subscribe();
}

async function stop(): Promise<void> {
  const shutdownSequence = [
    tokenServices.stop,
    server.stop,
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
