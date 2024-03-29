import { DateTime, Duration } from 'luxon';
import RaidService from '../database/lib/raid';
import logger from '../logger';
import * as io from '../server/socket.io';
import raidmode from '../streamelements/raidmode';
import twitchCache from '../twitch/cache';
import twitchApi from '../twitch/twitch_api';

export default async (payload: RaidPayload): Promise<void> => {
  if (!payload.viewers || payload.viewers < 10) return;
  logger.info(`new raid - ${payload.username}`);

  // Get userdata for the display name and id of the raider
  const [userData] = await twitchCache.getUsers([payload.username]).catch(() => []);
  if (userData) {
    payload.displayName = userData.display_name;
    const [channelData] = await twitchApi.getChannels([userData.id]).catch(() => []);
    if (channelData) payload.game = channelData.game_name;
    const [video] = await twitchApi.getArchivedVideosByUser(userData.id, 1).catch(() => []);
    if (video) {
      const now = DateTime.now();
      const range = Duration.fromObject({ minutes: 10 });
      const lowerBound = now.minus(range);
      const upperBound = now.plus(range);

      const startTime = DateTime.fromISO(video.created_at);
      const videoLength = Duration.fromISO(`PT${video.duration.toUpperCase()}`);
      const endTime = startTime.plus(videoLength);
      if (endTime > lowerBound && endTime < upperBound) {
        payload.streamLength = videoLength.toFormat('hh:mm:ss');
        payload.title = video.title;
      }
    }
  }
  raidmode.auto();

  // Emit to client regardless if successful database save
  const raidDoc = RaidService.create(payload);
  io.emit('raid', raidDoc);
  RaidService.save(raidDoc).catch((err) => {
    logger.error(err);
  });
};
