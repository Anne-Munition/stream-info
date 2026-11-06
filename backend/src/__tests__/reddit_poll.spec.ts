import nock from 'nock';
import { Poll } from 'snoostorm';
import Snoowrap from 'snoowrap';
import logger from '../logger';
import { withBackoff } from '../reddit_poll';

jest.mock('../logger');

const FREQUENCY = 10000;
const body = `<body class=theme-beta>${'blocked by network security'.repeat(100)}</body>`;

function statusError(statusCode: number) {
  return Object.assign(new Error(`${statusCode} - ${JSON.stringify(body)}`), {
    name: 'StatusCodeError',
    statusCode,
    error: body,
  });
}

describe('withBackoff', () => {
  const errorSpy = logger.error as jest.Mock;
  const infoSpy = logger.info as jest.Mock;
  const fetch = jest.fn<Promise<{ id: string }[]>, []>();
  let poll: Poll<{ id: string }>;
  let items: string[];

  async function ticks(count: number) {
    await jest.advanceTimersByTimeAsync(count * FREQUENCY);
  }

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
    items = [];
    poll = new Poll({ frequency: FREQUENCY, identifier: 'id', get: withBackoff(fetch) });
    poll.on('item', (item) => items.push(item.id));
  });

  afterEach(() => {
    poll.end();
    jest.useRealTimers();
  });

  it('passes items through while healthy without logging', async () => {
    fetch.mockResolvedValue([{ id: 'a' }]);
    await ticks(3);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(items).toEqual(['a']);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
  });

  describe('failure', () => {
    it('logs one short line with the status code and not the body', async () => {
      fetch.mockRejectedValue(statusError(403));
      await ticks(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith('Reddit feed failing: HTTP 403');
    });

    it('does not reject, which would reach the unhandledRejection handler', async () => {
      const get = withBackoff(fetch);
      fetch.mockRejectedValue(statusError(403));
      await expect(get()).resolves.toEqual([]);
    });

    it('logs the error code of a failure with no status', async () => {
      fetch.mockRejectedValue(
        Object.assign(new Error('Error: socket hang up'), {
          name: 'RequestError',
          cause: { code: 'ECONNRESET' },
        }),
      );
      await ticks(1);
      expect(errorSpy).toHaveBeenCalledWith('Reddit feed failing: ECONNRESET');
    });

    it('limits the length of a failure with only a message', async () => {
      fetch.mockRejectedValue(new Error(`${'x'.repeat(500)}\nsecond line`));
      await ticks(1);
      expect(errorSpy).toHaveBeenCalledWith(`Reddit feed failing: Error: ${'x'.repeat(100)}`);
    });
  });

  describe('repeat failure', () => {
    it('does not log the same failure again', async () => {
      fetch.mockRejectedValue(statusError(403));
      await ticks(200);
      expect(fetch.mock.calls.length).toBeGreaterThan(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('logs when the failure changes', async () => {
      fetch.mockRejectedValueOnce(statusError(403));
      fetch.mockRejectedValueOnce(statusError(403));
      fetch.mockRejectedValueOnce(statusError(500));
      fetch.mockRejectedValue(statusError(500));
      await ticks(200);
      expect(errorSpy.mock.calls).toEqual([
        ['Reddit feed failing: HTTP 403'],
        ['Reddit feed failing: HTTP 500'],
      ]);
    });

    it('doubles the wait between attempts up to 5 minutes', async () => {
      const attemptTimes: number[] = [];
      fetch.mockImplementation(() => {
        attemptTimes.push(Date.now());
        return Promise.reject(statusError(403));
      });
      await ticks(1 + 2 + 4 + 8 + 16 + 30 + 30);
      const waits = attemptTimes.slice(1).map((time, i) => (time - attemptTimes[i]) / 1000);
      expect(waits).toEqual([20, 40, 80, 160, 300, 300]);
    });
  });

  describe('recovery', () => {
    it('logs once, delivers the items and returns to the normal frequency', async () => {
      fetch.mockRejectedValueOnce(statusError(403));
      fetch.mockRejectedValueOnce(statusError(403));
      fetch.mockResolvedValue([{ id: 'a' }]);

      await ticks(1 + 2); // Both failures
      expect(fetch).toHaveBeenCalledTimes(2);

      await ticks(4); // Waits out the backoff, then the recovering poll
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(items).toEqual(['a']);
      expect(infoSpy.mock.calls).toEqual([['Reddit feed recovered after 2 failed poll(s)']]);

      await ticks(3); // Every tick polls again
      expect(fetch).toHaveBeenCalledTimes(6);
      expect(infoSpy).toHaveBeenCalledTimes(1);
    });

    it('logs and backs off from the start if the same failure returns', async () => {
      fetch.mockRejectedValueOnce(statusError(403));
      fetch.mockResolvedValueOnce([]);
      fetch.mockRejectedValueOnce(statusError(403));
      fetch.mockResolvedValue([]);

      await ticks(1 + 2 + 1); // Fail, recover, fail
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(errorSpy).toHaveBeenCalledTimes(2);

      await ticks(2); // One failed poll means a 20s wait
      expect(fetch).toHaveBeenCalledTimes(4);
      expect(infoSpy.mock.calls).toEqual([
        ['Reddit feed recovered after 1 failed poll(s)'],
        ['Reddit feed recovered after 1 failed poll(s)'],
      ]);
    });
  });

  describe('with the real Reddit client', () => {
    const r = new Snoowrap({
      userAgent: 'test',
      clientId: 'id',
      clientSecret: 'secret',
      username: 'username',
      password: 'password',
    });

    beforeEach(() => {
      jest.useRealTimers();
      poll.end();
      nock.disableNetConnect();
    });

    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('logs only the status code of a 403 HTML page', async () => {
      nock('https://www.reddit.com')
        .post('/api/v1/access_token')
        .reply(200, { access_token: 'token', expires_in: 3600, scope: '*' });
      nock('https://oauth.reddit.com')
        .get(/\/r\/annemunition\/new/)
        .reply(403, body, { 'content-type': 'text/html' });

      const get = withBackoff(() => r.getNew('annemunition', { limit: 5 }));

      await expect(get()).resolves.toEqual([]);
      expect(errorSpy.mock.calls).toEqual([['Reddit feed failing: HTTP 403']]);
    });
  });
});
