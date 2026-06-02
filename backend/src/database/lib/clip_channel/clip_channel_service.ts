import ClipChannel from './clip_channel_model';

async function add(channelId: string, channelName: string): Promise<void> {
  await new ClipChannel({ channelId, channelName }).save();
}

async function remove(channelId: string): Promise<void> {
  await ClipChannel.findOneAndDelete({ channelId });
}

async function has(channelId: string): Promise<boolean> {
  return Boolean(await ClipChannel.findOne({ channelId }));
}

export default {
  add,
  remove,
  has,
};
