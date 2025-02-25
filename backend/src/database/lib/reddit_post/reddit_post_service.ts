import RedditPost from './reddit_post_model';

async function add(postId: string): Promise<void> {
  await new RedditPost({ postId }).save();
}

async function remove(postId: string): Promise<void> {
  await RedditPost.findOneAndRemove({ postId });
}

async function has(postId: string): Promise<boolean> {
  return Boolean(await RedditPost.findOne({ postId }));
}

export default {
  add,
  remove,
  has,
};
