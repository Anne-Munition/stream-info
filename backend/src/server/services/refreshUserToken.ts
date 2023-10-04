import axios from 'axios';
import { getScopes } from '../../token';

const redirectUrl = process.env.TWITCH_CALLBACK_URL.replace(
  '/auth/callback',
  '/auth/token/renew/callback',
);

function accessRequestUrl(): string {
  const baseUrl = 'https://id.twitch.tv/oauth2/authorize';

  const url = new URL(baseUrl);
  url.searchParams.append('client_id', process.env.TWITCH_CLIENT_ID);
  url.searchParams.append('redirect_uri', redirectUrl);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', getScopes().join(' '));
  url.searchParams.append('force_verify', 'true');

  return url.toString();
}

function tokenRequestUrl(code: string): string {
  const baseUrl = 'https://id.twitch.tv/oauth2/token';

  const url = new URL(baseUrl);
  url.searchParams.append('client_id', process.env.TWITCH_CLIENT_ID);
  url.searchParams.append('client_secret', process.env.TWITCH_CLIENT_SECRET);
  url.searchParams.append('code', code);
  url.searchParams.append('grant_type', 'authorization_code');
  url.searchParams.append('redirect_uri', redirectUrl);

  return url.toString();
}

async function getNewToken(url: string) {
  return axios.post(url).then(({ data }: { data: TwitchUserToken }) => data);
}

async function storeToken(token: TwitchUserToken): Promise<void> {
  const keys: AWSKeys = {
    client_id: process.env.TWITCH_CLIENT_ID,
    access_token: token.access_token,
  };

  return axios.post(process.env.TOKEN_AWS_URL, keys, {
    headers: {
      'x-api-key': process.env.TOKEN_AWS_API_KEY,
    },
  });
}

export default {
  accessRequestUrl,
  tokenRequestUrl,
  getNewToken,
  storeToken,
};
