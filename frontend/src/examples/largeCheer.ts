import type { Cheer } from '../types/events';

const largeCheer: Cheer = {
  _id: '6313877db7e5fe37af30e3ed',
  payload: {
    userstate: {
      bits: '50000',
      'display-name': 'Username',
      'tmi-sent-ts': '1661963775724',
      username: 'username',
    },
    message: 'Cheer10000 Cheer10000 Cheer10000 Cheer10000 Cheer10000 PogChamp',
    emotes: {
      Cheer10000: {
        static:
          'https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/static/10000/1.png',
        animated:
          'https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/10000/1.gif',
        source: 'cheermote',
        tier: '10000',
        value: '10000',
      },
      PogChamp: {
        static:
          'https://static-cdn.jtvnw.net/emoticons/v2/305954156/static/dark/1.0',
        animated:
          'https://static-cdn.jtvnw.net/emoticons/v2/305954156/default/dark/1.0',
        source: 'twitch',
      },
    },
  },
  cleared: true,
  createdAt: '2022-09-08T16:46:27.143Z',
};

export default largeCheer;
