import tmi, { Client } from 'tmi.js';
import events from '../../events';
import logger from '../../logger';
import { getChannelName, getKeys } from '../../token';
import messageHandler from './message_handler';

// https://tmijs.com/

let client: Client | undefined;

function createClient(): Client {
  const nextClient = new tmi.Client({
    channels: [getChannelName()],
    identity: {
      username: getChannelName(),
      password: `oauth:${getKeys().access_token}`,
    },
    options: {
      skipMembership: true,
      skipUpdatingEmotesets: true,
    },
  });

  nextClient.on('connected', () => {
    events.state.updateAppState({ twitchIrc: true });
  });

  nextClient.on('disconnected', () => {
    events.state.updateAppState({ twitchIrc: false });
  });

  // https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md

  // New hypechat
  nextClient.on('raw_message', (userstate) => {
    if (userstate.tags?.['pinned-chat-paid-amount']) {
      try {
        events.cheer.hypechat(userstate);
      } catch (e) {
        logger.error(e);
      }
    }
  });

  // Username is continuing the Gift Sub they got from an anonymous user in channel.
  nextClient.on('anongiftpaidupgrade', (_channel, _username, userstate) => {
    try {
      events.subscription.paidUpgrade(userstate);
    } catch (e) {
      logger.error(e);
    }
  });

  // Username has cheered to a channel.
  nextClient.on('cheer', async (_channel, userstate, message) => {
    try {
      await events.cheer.cheer(userstate, message);
    } catch (e) {
      logger.error(e);
    }
  });

  // Username is continuing the Gift Sub they got from sender in channel.
  nextClient.on('giftpaidupgrade', (_channel, _username, _sender, userstate) => {
    try {
      events.subscription.paidUpgrade(userstate);
    } catch (e) {
      logger.error(e);
    }
  });

  // Received a message. This event is fired whenever you receive a chat, action or whisper message.
  nextClient.on('message', (_channel, userstate, message, _self) => {
    try {
      messageHandler(userstate, message);
    } catch (e) {
      logger.error(e);
    }
  });

  // User is upgrading from Prime to a normal tier sub
  nextClient.on('primepaidupgrade', (_channel, _username, _methods, userstate) => {
    try {
      events.subscription.paidUpgrade(userstate);
    } catch (e) {
      logger.error(e);
    }
  });

  // Channel is now being raided by another broadcaster.
  nextClient.on('raided', async (_channel, username, viewers) => {
    try {
      await events.raid({
        username,
        viewers,
      });
    } catch (e) {
      logger.error(e);
    }
  });

  // Username has resubbed on a channel.
  nextClient.on('resub', (_channel, _username, _months, message, userstate, _methods) => {
    try {
      events.subscription.resub(userstate, message);
    } catch (e) {
      logger.error(e);
    }
  });

  // The current state of the channel.
  nextClient.on('roomstate', (_channel, state) => {
    try {
      events.state.setRoomstate(state);
    } catch (e) {
      logger.error(e);
    }
  });

  // Username gifted a subscription to recipient in a channel.
  nextClient.on(
    'subgift',
    (_channel, _username, _streakMonths, _recipient, _methods, userstate) => {
      try {
        events.subscription.subgift(userstate);
      } catch (e) {
        logger.error(e);
      }
    },
  );

  // Username is gifting a subscription to someone in a channel.
  nextClient.on('submysterygift', (_channel, _username, numOfSubs, _methods, userstate) => {
    try {
      events.subscription.submysterygift(userstate, numOfSubs);
    } catch (e) {
      logger.error(e);
    }
  });

  // Username has subscribed to a channel.
  nextClient.on('subscription', (_channel, _username, _method, _message, userstate) => {
    try {
      events.subscription.newSub(userstate);
    } catch (e) {
      logger.error(e);
    }
  });

  return nextClient;
}

function getOrCreateClient(): Client {
  if (!client) client = createClient();
  return client;
}

export async function connect(): Promise<void> {
  const currentClient = getOrCreateClient();
  await currentClient.connect();
  logger.info(
    `Connected to Twitch channel: ${getChannelName()} as: ${currentClient.getUsername()}`,
  );
}

export async function disconnect(): Promise<void> {
  if (!client) return;
  await client.disconnect();
  logger.info('Disconnected from Twitch IRC');
}

// https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Commands.md

export async function deleteMessage(messageUUID: string): Promise<void> {
  logger.debug(`twitch DELETE_MESSAGE: ${messageUUID}`);
  if (!client) return;
  if (!process.env.NO_ACTIONS) {
    try {
      await client.deletemessage(getChannelName(), messageUUID);
    } catch (e) {
      logger.error(e);
    }
  }
}

export async function say(message: string): Promise<void> {
  logger.debug(`twitch SAY: ${message}`);
  if (!client) return;
  if (!process.env.NO_ACTIONS) {
    try {
      await client.say(getChannelName(), message);
    } catch (e) {
      logger.error(e);
    }
  }
}

export function getClient(): Client {
  return getOrCreateClient();
}
