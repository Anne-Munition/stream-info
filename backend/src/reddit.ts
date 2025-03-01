import axios from 'axios';
import { SubmissionStream } from 'snoostorm';
import Snoowrap from 'snoowrap';
import RedditPostService from './database/lib/reddit_post';
import logger from './logger';

const socialNotificationsRoleId = '1343660317841948694';
const goLiveNotificationsRoleId = '1343659876253175849';

const r = new Snoowrap({
  userAgent: 'StreamInfo',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

const submissions = new SubmissionStream(r, {
  subreddit: 'annemunition',
  limit: 5,
  pollTime: 10000,
});

submissions.on('item', async (post) => {
  if (post.author.name.toLowerCase() !== 'annemunition') return;

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

  try {
    const message =
      `<@&${mentionedRoleId}> ${headerText}\n` +
      `${post.title}\n` +
      `https://reddit.com${post.permalink}`;

    if (process.env.DISCORD_REDDIT_URL)
      await axios.post(process.env.DISCORD_REDDIT_URL, {
        content: message,
      });

    logger.info(`Posted Reddit to Discord: ${post.title}`);
  } catch (err) {
    logger.error('Failed to send Reddit post message to Discord', err);
  }
});
