import { Document, Schema, model } from 'mongoose';

const schema = new Schema({
  postId: { type: String, unique: true },
});

export interface RedditPost extends Document {
  postId: string;
}

export default model<RedditPost>('reddit_posts', schema);
