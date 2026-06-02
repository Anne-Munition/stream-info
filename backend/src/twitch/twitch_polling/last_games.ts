import LastGameService from '../../database/lib/last_game';

export const gamesToNotSave = [
  'Gaming Talk Shows',
  'Creative',
  'Social Eating',
  'IRL',
  'Music',
  'Games + Demos',
  'The Game Awards',
  'Talk Shows',
  'E3 2018',
  'E3 2019',
  'Just Chatting',
  'Special Events',
];

export function mutateName(name: string): string {
  switch (name) {
    case "PLAYERUNKNOWN'S BATTLEGROUNDS":
      return 'PUBG';
    default:
      return name;
  }
}

export default async (stream: TwitchStream | undefined) => {
  if (!stream) return;
  // Exit if game is in list of games to not save by name
  if (gamesToNotSave.find((noSave) => stream.game_name === noSave)) return;
  const games = await LastGameService.list();
  // Exit if the current game is already in the first position
  if (games[0] && games[0].id === stream.game_id) return;
  // See if the game is in the list at all
  const hasGame = games.find((g) => g.id === stream.game_id);
  if (hasGame) {
    // Game in list already, remove it
    await LastGameService.remove(String(hasGame._id));
  } else if (games.length === 5) {
    // We are about to add an entry and the list is already at 5 entries
    // Delete the last entry
    await LastGameService.remove(String(games[4]._id));
  }
  await LastGameService.add(stream.game_id, stream.game_name);
};
