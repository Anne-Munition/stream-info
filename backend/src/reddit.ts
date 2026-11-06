import axios from 'axios';
import { Poll } from 'snoostorm';
import Snoowrap from 'snoowrap';
import RedditPostService from './database/lib/reddit_post';
import logger from './logger';
import { withBackoff } from './reddit_poll';

const socialNotificationsRoleId = '1343660317841948694';
const goLiveNotificationsRoleId = '1343659876253175849';

const r = new Snoowrap({
  userAgent: `node:stream-info:1.0.0 (by /u/${process.env.REDDIT_USERNAME})`,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

const submissions = new Poll<Snoowrap.Submission>({
  frequency: 10000,
  identifier: 'id',
  get: withBackoff(() => r.getNew('annemunition', { limit: 5 })),
});

submissions.on('item', async (post) => {
  if (post.author.name.toLowerCase() !== 'annemunition') return;
  if (post.created_utc * 1000 < Date.now() - 10 * 60 * 1000) return; // Ignore posts older than 10 minutes

  const alreadyPosted = await RedditPostService.has(post.id);
  if (alreadyPosted) return;
  await RedditPostService.add(post.id);

  const isLiveStream =
    post.link_flair_text?.includes(':broadcast:') ||
    post.selftext?.toLowerCase().includes('twitch.tv/annemunition');
  const mentionedRoleId = isLiveStream ? goLiveNotificationsRoleId : socialNotificationsRoleId;
  const headerText = isLiveStream
    ? '**AnneMunition** just went live!'
    : 'New post by **AnneMunition**:';
  const shortUrl = `https://redd.it/${post.id}`;

  const message = `<@&${mentionedRoleId}> ${headerText}\n${post.title}\n${shortUrl}`;

  try {
    if (process.env.DISCORD_REDDIT_URL)
      await axios.post(process.env.DISCORD_REDDIT_URL, {
        content: message,
      });

    logger.info(`Posted Reddit to Discord: ${post.title}`);
  } catch (err) {
    logger.error('Failed to send Reddit post message to Discord', err);
  }
});
