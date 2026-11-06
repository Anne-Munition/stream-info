import logger from './logger';

// Waits double per failure (20s, 40s, ... at a 10s frequency) up to 5 minutes. Stay under the
// 10 minute post age limit in reddit.ts so a post made during a failure can still be announced.
const MAX_TICKS_BETWEEN_ATTEMPTS = 30;
const MAX_MESSAGE_LENGTH = 100;

interface PollError extends Error {
  statusCode?: number;
  code?: string;
  cause?: { code?: string };
}

// Reddit errors include the whole response body in their message, and the request options in their
// properties, so only ever log the parts picked out here.
function describeFailure(err: PollError): string {
  if (err.statusCode) return `HTTP ${err.statusCode}`;
  const code = err.cause?.code ?? err.code;
  if (code) return code;
  return `${err.name}: ${String(err.message).split('\n')[0].slice(0, MAX_MESSAGE_LENGTH)}`;
}

// Wraps a snoostorm Poll's get function, which would otherwise reject on every failed poll. Each
// call is one tick of the Poll's interval. Ticks are skipped while backing off.
export function withBackoff<T>(fetch: () => PromiseLike<T[]>): () => Promise<T[]> {
  let failures = 0;
  let lastFailure: string | null = null;
  let ticksToSkip = 0;

  return async () => {
    if (ticksToSkip > 0) {
      ticksToSkip--;
      return [];
    }

    try {
      const items = await fetch();
      if (failures > 0) logger.info(`Reddit feed recovered after ${failures} failed poll(s)`);
      failures = 0;
      lastFailure = null;
      return items;
    } catch (err) {
      failures++;
      ticksToSkip = Math.min(2 ** failures, MAX_TICKS_BETWEEN_ATTEMPTS) - 1;
      const failure = describeFailure(err as PollError);
      if (failure !== lastFailure) logger.error(`Reddit feed failing: ${failure}`);
      lastFailure = failure;
      return [];
    }
  };
}
