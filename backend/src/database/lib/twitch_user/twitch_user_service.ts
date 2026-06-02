import TwitchUser, { TwitchUserDoc } from './twitch_user_model';

type TwitchUserDocument = InstanceType<typeof TwitchUser>;

async function find(identities: string[]): Promise<TwitchUserDoc[]> {
  const names: string[] = [];
  const ids: string[] = [];
  identities.forEach((x) => {
    if (/$\d+^/.test(x)) {
      if (!ids.includes(x)) ids.push(x);
    } else {
      if (!names.includes(x)) names.push(x);
    }
  });

  return TwitchUser.find().or([{ twitchId: { $in: ids } }, { twitchName: { $in: names } }]);
}

function create(users: TwitchUser[]): TwitchUserDocument[] {
  return users.map((x) => new TwitchUser({ twitchId: x.id, twitchName: x.login, payload: x }));
}

async function save(docs: TwitchUserDocument[]): Promise<void> {
  await TwitchUser.bulkSave(docs).catch();
}

async function remove(docIds: string[]): Promise<void> {
  await TwitchUser.deleteMany({ _id: { $in: docIds } });
}

export default {
  find,
  create,
  save,
  remove,
};
