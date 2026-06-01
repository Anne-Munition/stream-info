import { connect, disconnect } from '../se_socket';

jest.mock('socket.io-client', () => jest.fn());

jest.mock('../../logger');

type Handler = (...args: unknown[]) => void;

class MockSocket {
  handlers: Record<string, Handler[]> = {};
  emit = jest.fn();
  close = jest.fn();
  on = jest.fn((event: string, handler: Handler) => {
    this.handlers[event] ??= [];
    this.handlers[event].push(handler);
    return this;
  });
  removeAllListeners = jest.fn(() => {
    this.handlers = {};
    return this;
  });

  trigger(event: string, ...args: unknown[]): void {
    for (const handler of this.handlers[event] ?? []) {
      handler(...args);
    }
  }
}

describe('streamelements se_socket', () => {
  const AUTH_TIMEOUT_MS = 15000;
  const RECONNECT_DELAY_MS = 5000;
  const sockets: MockSocket[] = [];
  const ioMock = jest.requireMock('socket.io-client') as jest.Mock;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    sockets.length = 0;

    ioMock.mockImplementation(() => {
      const socket = new MockSocket();
      sockets.push(socket);
      return socket;
    });
  });

  afterEach(() => {
    disconnect();
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('reconnects when authentication never completes', () => {
    connect();

    const firstSocket = sockets[0];
    firstSocket.trigger('connect');

    expect(firstSocket.emit).toHaveBeenCalledWith('authenticate', {
      method: 'jwt',
      token: process.env.STREAMELEMENTS_JWT,
    });

    jest.advanceTimersByTime(AUTH_TIMEOUT_MS);

    expect(firstSocket.removeAllListeners).toHaveBeenCalled();
    expect(firstSocket.close).toHaveBeenCalled();

    jest.advanceTimersByTime(RECONNECT_DELAY_MS);

    expect(ioMock).toHaveBeenCalledTimes(2);
  });

  it('reconnects after an unexpected disconnect', () => {
    connect();

    const firstSocket = sockets[0];
    firstSocket.trigger('disconnect', 'transport close');

    jest.advanceTimersByTime(RECONNECT_DELAY_MS);

    expect(ioMock).toHaveBeenCalledTimes(2);
  });

  it('stops reconnecting after an explicit disconnect', () => {
    connect();

    const firstSocket = sockets[0];
    firstSocket.trigger('disconnect', 'transport close');

    disconnect();
    jest.advanceTimersByTime(RECONNECT_DELAY_MS);

    expect(ioMock).toHaveBeenCalledTimes(1);
  });
});
