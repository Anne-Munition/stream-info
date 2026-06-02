import TwitchUserService from '../../database/lib/twitch_user';
import logger from '../../logger';
import twitchApi from '../twitch_api';

export default async (identities: string[]): Promise<TwitchUser[]> => {
  const time = Date.now();

  // Get all the users we can from our database
  logger.debug(`Searching database for info on ${identities.length} user identities`);
  const usersInDatabase = await TwitchUserService.find(identities);
  logger.debug(`Database held info on ${usersInDatabase.length} users`);

  // Map an array of ids for easier searching
  const usersInDatabaseIdsArray = usersInDatabase.map((x) => x.twitchId);
  const usersInDatabaseNamesArray = usersInDatabase.map((x) => x.twitchName);

  // Get identities not in the database or expired
  const identitiesToLookup: string[] = [];
  identities.forEach((identity) => {
    if (identitiesToLookup.includes(identity)) return;

    if (
      !usersInDatabaseIdsArray.includes(identity) &&
      !usersInDatabaseNamesArray.includes(identity)
    ) {
      identitiesToLookup.push(identity);
      return;
    }

    const doc = usersInDatabase.find((x) => x.twitchId === identity || x.twitchName === identity);
    if (!doc) {
      identitiesToLookup.push(identity);
    } else {
      if (identitiesToLookup.includes(doc.twitchName) || identitiesToLookup.includes(doc.twitchId))
        return;
      if (new Date(doc.expires).valueOf() <= time) {
        identitiesToLookup.push(identity);
      }
    }
  });

  logger.debug(`${identitiesToLookup.length} identities to lookup`);

  let twitchResults: TwitchUser[] = [];
  // Get user data from twitch
  if (identitiesToLookup.length > 0) {
    twitchResults = await twitchApi.getUsers(identitiesToLookup);
    logger.debug(`Got twitch data on ${twitchResults.length} users`);
  }

  // Delete expired docs from database
  const expiredDocs = usersInDatabase
    .filter((x) => new Date(x.expires).valueOf() <= time)
    .map((x) => String(x._id));
  logger.debug(`${expiredDocs.length} expired user docs found`);
  if (expiredDocs.length > 0) {
    await TwitchUserService.remove(expiredDocs);
    logger.debug(`Removed ${expiredDocs.length} expired user docs from the database`);
  }

  // Create and save new docs
  let docs: ReturnType<typeof TwitchUserService.create> = [];
  logger.debug(`${twitchResults.length} new user docs to save`);
  if (twitchResults.length > 0) {
    docs = TwitchUserService.create(twitchResults);
    await TwitchUserService.save(docs);
    logger.debug(`Saved ${docs.length} users docs to the database`);
  }

  const unexpiredDocs = usersInDatabase.filter((x) => new Date(x.expires).valueOf() > time);
  const results = unexpiredDocs.map((x) => x.payload).concat(docs.map((x) => x.payload));
  logger.debug(`returning ${results.length} users`);
  return results;
};
