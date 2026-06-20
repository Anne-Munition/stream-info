import * as emotes from './emotes';
import logger from './logger';
import * as token from './token';
import * as twitchIrc from './twitch/twitch_irc';
import * as twitchPolling from './twitch/twitch_polling';

let started = false;

export async function start(): Promise<void> {
  if (started) return;
  if (!token.isValid()) {
    logger.warn(
      'Skipping Twitch token-dependent services until broadcaster reauthorization completes.',
    );
    return;
  }

  await emotes.init();
  await twitchIrc.connect();
  twitchPolling.start();
  started = true;
}

export async function stop(): Promise<void> {
  if (!started) return;
  twitchPolling.stop();
  await twitchIrc.disconnect();
  started = false;
}

export function isStarted(): boolean {
  return started;
}
