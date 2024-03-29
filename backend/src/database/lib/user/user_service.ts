import User, { UserDoc } from './user_model';

async function updateProfile(profile: any): Promise<UserDoc> {
  return User.findOneAndUpdate({ twitchId: profile.id }, { profile }, { upsert: true, new: true });
}

async function updateSettings(id: string, settings: any): Promise<void> {
  const user = await getUser(id);
  if (!user) return;
  user.settings = Object.assign({}, user.settings, settings);
  await user.save();
}

async function getUser(id: string): Promise<UserDoc | null> {
  return User.findOne({ twitchId: id });
}

async function getUserSettings(id: string): Promise<UserSettings | null> {
  const user = await getUser(id);
  if (!user) return null;
  return user.settings;
}

export default {
  updateProfile,
  updateSettings,
  getUserSettings,
  getUser,
};
