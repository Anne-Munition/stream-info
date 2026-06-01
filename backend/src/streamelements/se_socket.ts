// https://github.com/StreamElements/api-docs/blob/main/docs/Websockets.md

import socketIoClient from 'socket.io-client';
import events from '../events';
import logger from '../logger';

const STREAMELEMENTS_WS_URL = 'https://realtime.streamelements.com';
const AUTH_TIMEOUT_MS = 15000;
const RECONNECT_DELAY_MS = 5000;

type SocketHandler<TArgs extends unknown[] = unknown[]> = (...args: TArgs) => void;

interface StreamElementsSocket {
  close(): StreamElementsSocket;
  emit(event: string, payload: unknown): void;
  on<TArgs extends unknown[]>(event: string, handler: SocketHandler<TArgs>): StreamElementsSocket;
  removeAllListeners(): StreamElementsSocket;
}

const createSocket = socketIoClient as unknown as (
  url: string,
  options: {
    transports: string[];
    reconnection: boolean;
    timeout: number;
  },
) => StreamElementsSocket;

let socket: StreamElementsSocket | null = null;
let authTimeout: NodeJS.Timeout | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let shouldReconnect = false;

function clearAuthTimeout(): void {
  if (!authTimeout) return;

  clearTimeout(authTimeout);
  authTimeout = null;
}

function clearReconnectTimeout(): void {
  if (!reconnectTimeout) return;

  clearTimeout(reconnectTimeout);
  reconnectTimeout = null;
}

function closeSocket(target: StreamElementsSocket | null = socket): void {
  if (!target) return;

  if (socket === target) socket = null;
  target.removeAllListeners();
  target.close();
}

function scheduleReconnect(reason: string): void {
  if (!shouldReconnect || reconnectTimeout) return;

  logger.warn(`Reconnecting to StreamElements in ${RECONNECT_DELAY_MS / 1000}s (${reason})`);
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    connect();
  }, RECONNECT_DELAY_MS);
}

function armAuthTimeout(target: StreamElementsSocket): void {
  clearAuthTimeout();

  authTimeout = setTimeout(() => {
    if (!shouldReconnect || socket !== target) return;

    logger.warn('StreamElements authentication timed out');
    closeSocket(target);
    events.state.updateAppState({ seWs: false });
    scheduleReconnect('authentication timeout');
  }, AUTH_TIMEOUT_MS);
}

export function connect(): void {
  shouldReconnect = true;
  clearReconnectTimeout();
  closeSocket();

  const nextSocket = createSocket(STREAMELEMENTS_WS_URL, {
    transports: ['websocket'],
    reconnection: false,
    timeout: AUTH_TIMEOUT_MS,
  });
  socket = nextSocket;
  armAuthTimeout(nextSocket);

  nextSocket.on('connect', () => {
    if (socket !== nextSocket) return;

    armAuthTimeout(nextSocket);
    nextSocket.emit('authenticate', {
      method: 'jwt',
      token: process.env.STREAMELEMENTS_JWT,
    });
  });

  nextSocket.on('authenticated', async (data: SE_WS_AuthData) => {
    if (socket !== nextSocket) return;

    clearAuthTimeout();
    logger.info(`Connected to StreamElements channel ${data.channelId}`);
    events.state.updateAppState({ seWs: true });
  });

  nextSocket.on('unauthorized', () => {
    if (socket !== nextSocket) return;

    shouldReconnect = false;
    clearAuthTimeout();
    clearReconnectTimeout();
    logger.error('StreamElements authentication error.');
    events.state.updateAppState({ seWs: false });
    closeSocket(nextSocket);
  });

  nextSocket.on('connect_error', (error: Error) => {
    if (socket !== nextSocket) return;

    clearAuthTimeout();
    logger.warn(`StreamElements connection error: ${error.message}`);
    closeSocket(nextSocket);
    events.state.updateAppState({ seWs: false });
    scheduleReconnect('connection error');
  });

  nextSocket.on('disconnect', (reason: string) => {
    if (socket !== nextSocket) return;

    clearAuthTimeout();
    closeSocket(nextSocket);
    logger.warn(`Disconnected from StreamElements (${reason})`);
    events.state.updateAppState({ seWs: false });

    if (reason !== 'io client disconnect') {
      scheduleReconnect(`disconnect: ${reason}`);
    }
  });

  nextSocket.on('event', (event: SE_WS_Event) => {
    if (event.type === 'tip') events.tip(event);
  });
}

export function disconnect(): void {
  shouldReconnect = false;
  clearAuthTimeout();
  clearReconnectTimeout();
  closeSocket();
  events.state.updateAppState({ seWs: false });
}
