import { getChannelId } from '../../token';
import secret from './secret';

export default function (): EventSub_Sub[] {
  return [
    {
      type: 'channel.follow',
      version: '2',
      condition: {
        broadcaster_user_id: getChannelId(),
        moderator_user_id: getChannelId(),
      },
      transport: {
        method: 'webhook',
        callback: process.env.TWITCH_EVENT_SUB_URL,
        secret,
      },
    },
  ];
}
