import HostService from '../../database/lib/host';
import twitchApi from '../../twitch/twitch_api';
import getChannels from '../../twitch/twitch_api/__stubs__/getChannels';
import getUsers from '../../twitch/twitch_api/__stubs__/getUsers';
import hosted from '../hosted';

jest.useFakeTimers();

jest.spyOn(twitchApi, 'getUsers').mockImplementation(() => {
  return Promise.resolve(getUsers.data);
});

jest.spyOn(twitchApi, 'getChannels').mockImplementation(() => {
  return Promise.resolve(getChannels.data);
});

const saveSpy = jest.spyOn(HostService, 'save');

describe('hosted event', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('saves host to database', async () => {
    const payload = {
      username: 'annemunition',
      viewers: 100,
      autohost: false,
      raid: false,
    };

    await hosted(payload);

    expect(saveSpy).toHaveBeenCalled();
    expect(saveSpy.mock.calls[0][0].payload).toMatchObject({
      username: 'annemunition',
      viewers: 100,
      autohost: false,
      raid: false,
      game: "Tom Clancy's Rainbow Six Siege",
      displayName: 'AnneMunition',
    });
  });

  it('does not save if autohost', async () => {
    const payload = {
      username: 'annemunition',
      viewers: 100,
      autohost: true,
      raid: false,
    };

    await hosted(payload);

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('does not save if less than 10 viewers', async () => {
    const payload = {
      username: 'annemunition',
      viewers: 9,
      autohost: false,
      raid: false,
    };

    await hosted(payload);

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('saves raid to database', async () => {
    const payload = {
      username: 'annemunition',
      viewers: 100,
      autohost: false,
      raid: true,
    };

    await hosted(payload);

    expect(saveSpy).toHaveBeenCalled();
    expect(saveSpy.mock.calls[0][0].payload).toMatchObject({
      username: 'annemunition',
      viewers: 100,
      autohost: false,
      raid: true,
      game: "Tom Clancy's Rainbow Six Siege",
      displayName: 'AnneMunition',
    });
  });
});