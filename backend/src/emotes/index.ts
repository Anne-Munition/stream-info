import _ from 'lodash';
import tmi from 'tmi.js';
import { CheerDoc } from '../database/lib/cheer/cheer_model';
import { RaidDoc } from '../database/lib/raid/raid_model';
import { SubscriptionDoc } from '../database/lib/subscription/subscription_model';
import { TipDoc } from '../database/lib/tip/tip_model';
import logger from '../logger';
import bttvEmotes from './bttv';
import cheermotes from './cheermotes';
import ffzEmotes from './ffz';
import twitchEmotes from './twitch';

const cheermoteReg = /^(\D*)(\d+)$/;

export async function fetch() {
  try {
    logger.debug('caching ffz emotes');
    await ffzEmotes.fetch();
  } catch (e) {}

  try {
    logger.debug('caching bttv emotes');
    await bttvEmotes.fetch();
  } catch (e) {}

  try {
    logger.debug('caching twitch channel cheermotes');
    await cheermotes.fetch();
  } catch (e) {}

  setTimeout(fetch, 1000 * 60 * 60);
}

const emotesToSkip = ['Hey', 'Happy'];

function getMatches(words: string[], set: MyEmotes): ParsedEmotes {
  const emotes: ParsedEmotes = {};
  words.forEach((word) => {
    if (word === ' ') return;
    if (emotesToSkip.includes(word)) return;
    const match = set[word];
    if (match) {
      if (!emotes[word]) {
        emotes[word] = { ...match };
      }
    }
  });
  return emotes;
}

function getFFZMatches(words: string[]): ParsedEmotes {
  return getMatches(words, ffzEmotes.get());
}

function getBttvMatches(words: string[]): ParsedEmotes {
  return getMatches(words, bttvEmotes.get());
}

function getCheermoteMatches(words: string[]): ParsedEmotes {
  const emotes: ParsedEmotes = {};
  const cheermoteData = cheermotes.get();

  words.forEach((word) => {
    if (cheermoteReg.test(word)) {
      const match = word.match(cheermoteReg);
      if (match) {
        const [, prefix, value] = match;
        const found = cheermoteData.find((x) => x.prefix.toLowerCase() === prefix.toLowerCase());

        if (found) {
          let tier = found.tiers[found.tiers.length - 1];
          for (let i = found.tiers.length - 1; i >= 0; i--) {
            if (parseInt(value) >= found.tiers[i].min_bits) break;
            if (i === 0) break;
            tier = found.tiers[i - 1];
          }

          const code = prefix + value;
          if (!emotes[code]) {
            emotes[code] = {
              static: tier.images.dark.static['1'],
              animated: tier.images.dark.animated['1'],
              source: 'cheermote',
              tier: tier.id,
              value,
            };
          }
        }
      }
    }
  });
  return emotes;
}

function getTwitchMatches(userstate: tmi.ChatUserstate, message: string): ParsedEmotes {
  const parsedEmotes: ParsedEmotes = {};
  const { emotes } = userstate;
  if (!emotes) return parsedEmotes;
  for (const id in emotes) {
    emotes[id].forEach((e) => {
      const i = e.split('-');
      const code = message.slice(parseInt(i[0]), parseInt(i[1]) + 1);
      if (code.includes(' ')) return;
      if (!parsedEmotes[code]) {
        parsedEmotes[code] = {
          static: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/static/dark/1.0`,
          animated: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0`,
          source: 'twitch',
        };
      }
    });
  }
  return parsedEmotes;
}

export function parseCheerMessage(userstate: tmi.ChatUserstate, message: string): ParsedEmotes {
  if (!message) return {};
  const words = message.split(' ');
  const ffz = getFFZMatches(words);
  const bttv = getBttvMatches(words);
  const cheermotes = getCheermoteMatches(words);
  const twitch = getTwitchMatches(userstate, message);
  return Object.assign(ffz, bttv, cheermotes, twitch);
}

export function parseSubMessage(
  userstate: tmi.ChatUserstate,
  message: string | undefined,
): ParsedEmotes {
  if (!message) return {};
  const words = message.split(' ');
  const ffz = getFFZMatches(words);
  const bttv = getBttvMatches(words);
  const twitch = getTwitchMatches(userstate, message);
  return Object.assign(ffz, bttv, twitch);
}

export async function parseTipMessage(message: string, set?: MyEmotes): Promise<ParsedEmotes> {
  if (!message) return {};
  const words = message.split(' ');
  const ffz = getFFZMatches(words);
  const bttv = getBttvMatches(words);
  const twitch = getMatches(words, set ? set : await twitchEmotes.get(words));
  return Object.assign(ffz, bttv, twitch);
}

export async function parseBulkMessages(payload: {
  cheers: CheerDoc[];
  raids: RaidDoc[];
  subscriptions: SubscriptionDoc[];
  tips: TipDoc[];
}) {
  payload.cheers.forEach((x) => {
    x.payload.emotes = parseCheerMessage(x.payload.userstate, x.payload.message);
  });
  payload.subscriptions.forEach((x) => {
    if (!x.payload.message) return;
    x.payload.emotes = parseSubMessage(x.payload.userstate, x.payload.message);
  });
  const tipWords = _.uniq(
    _.flatten(
      payload.tips.map((x) => {
        if (!x.payload.message) return [' '];
        return x.payload.message.split(' ');
      }),
    ),
  );
  const set = await twitchEmotes.get(tipWords);
  for (let i = 0; i < payload.tips.length; i++) {
    if (!payload.tips[i].payload.message) continue;
    payload.tips[i].payload.emotes = await parseTipMessage(payload.tips[i].payload.message, set);
  }
  return payload;
}
