import axios from 'axios';
import logger from './logger';
import { clearTokenInvalid, isTokenInvalid, markTokenInvalid } from './tokenStatus';
import twitchApi from './twitch/twitch_api';

const requiredScopes = [
  'bits:read',
  'channel:edit:commercial',
  'channel:moderate',
  'channel:read:redemptions',
  'channel:read:subscriptions',
  'chat:edit',
  'chat:read',
  'clips:edit',
  'moderation:read',
];

export interface Keys {
  access_token: string;
  client_id: string;
}

let validToken = false;
let keys: Keys;
let channel: string;
let id: string;

export function isValid(): boolean {
  return validToken && !isTokenInvalid();
}

export function getKeys(): Keys {
  return keys;
}

export function getChannelName(): string {
  return channel;
}

export function getChannelId(): string {
  return id;
}

export function getScopes(): string[] {
  return requiredScopes;
}

let timer: NodeJS.Timeout;
function startTimer(): void {
  timer = setTimeout(validate, 1000 * 60 * 60);
}

interface ValidatedToken {
  login: string;
  user_id: string;
}

function setValid(nextKeys: Keys, validatedToken: ValidatedToken): void {
  logger.debug('token is valid');
  id = validatedToken.user_id;
  channel = validatedToken.login;
  keys = nextKeys;
  validToken = true;
  clearTokenInvalid();
}

export function setInvalid(): void {
  validToken = false;
  markTokenInvalid();
}

async function validateKeys(nextKeys: Keys): Promise<ValidatedToken> {
  const { scopes, login, user_id } = await twitchApi.validateToken(nextKeys.access_token);
  if (!hasScopes(scopes)) {
    setInvalid();
    throw new Error('Twitch token missing required scopes');
  }

  return {
    login,
    user_id,
  };
}

async function saveAWSKeys(nextKeys: Keys): Promise<void> {
  const config = {
    headers: {
      'x-api-key': process.env.TOKEN_AWS_API_KEY,
    },
  };

  try {
    await axios.put(process.env.TOKEN_AWS_URL, nextKeys, config);
  } catch (error: any) {
    const status = error?.response?.status;
    if (status !== 404 && status !== 405) throw error;
    await axios.post(process.env.TOKEN_AWS_URL, nextKeys, config);
  }
}

export async function updateUserToken(accessToken: string): Promise<void> {
  logger.info('Updating Twitch user token');
  if (timer) clearTimeout(timer);

  const nextKeys = {
    access_token: accessToken,
    client_id: process.env.TWITCH_CLIENT_ID,
  };

  const validatedToken = await validateKeys(nextKeys);
  await saveAWSKeys(nextKeys);
  setValid(nextKeys, validatedToken);
  startTimer();
}

export async function validate(): Promise<void> {
  logger.debug('checking token validity');
  if (timer) clearTimeout(timer);
  const awsKeys: Keys = await getAWSKeys();
  // if (process.env.NODE_ENV === 'production') {
  //awsKeys = await getAWSKeys();
  //} else {
  //   awsKeys = {
  //    client_id: process.env.TWITCH_CLIENT_ID,
  //   access_token: process.env.DEV_ACCESS_TOKEN,
  //  };
  // }
  await twitchApi
    .validateToken(awsKeys.access_token)
    .then(({ scopes, login, user_id }) => {
      if (hasScopes(scopes)) {
        setValid(awsKeys, {
          login,
          user_id,
        });
      } else {
        setInvalid();
      }
    })
    .catch(({ response }) => {
      if (response.status === 401) {
        logger.warn('Twitch Token is invalid!');
        setInvalid();
      }
    })
    .finally(() => {
      startTimer();
    });
}

export function hasScopes(scopes: string[]): boolean {
  for (let i = 0; i < requiredScopes.length; i++) {
    if (!scopes.includes(requiredScopes[i])) {
      logger.warn(`Twitch Token missing scopes! - ${requiredScopes[i]}`);
      return false;
    }
  }
  return true;
}

async function getAWSKeys(): Promise<Keys> {
  logger.debug('getting keys from aws');
  return axios
    .get(process.env.TOKEN_AWS_URL, {
      headers: {
        'x-api-key': process.env.TOKEN_AWS_API_KEY,
      },
    })
    .then(({ data }) => {
      return data;
    });
}
